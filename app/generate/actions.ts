'use server';

import axios from 'axios';
import { DOMParser } from 'xmldom'
import { z } from 'zod';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import pptxgen from 'pptxgenjs';
import { randomUUID } from 'crypto';
import path from 'path';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

type VideoMetaData = {
    length: number | null;
    subtitlesURL: string | null;
}

type SubtitleItem = {
    text: string;
};

type SlideContent = {
    title: string;
    content: string[];
}

const TitleAndDescriptionSchema = z.object({
    title: z.string(),
    description: z.string()
})

const arrayOfObjectsSchema = z.object({
    arrayOfObjects: z.array(
        z.object({
            title: z.string(),
            content: z.array(z.string())
        })
    )
})

type TitleDescription = z.infer<typeof TitleAndDescriptionSchema>

export const CreatePowerpoint = async (videoId: string) => {

}

export async function parseXMLContent(url: string): Promise<SubtitleItem[] | null> {
    try {
        const res = await axios.get(url);
        const parser = new DOMParser();
        const doc = parser.parseFromString(res.data, 'application/xml');
        const textElements = doc.getElementsByTagName('text');

        return Array.from(textElements).map((element) => ({
            text: element.textContent || ""
        }));
    } catch (error) {
        console.error(error);
        throw new Error('Failed to parse XML content');
    }
}

export async function GetVideoLengthAndSubtitles(videoId: string): Promise<VideoMetaData> {
    try {
        const options = {
            method: 'GET',
            url: 'https://yt-api.p.rapidapi.com/video/info',
            params: {
                id: videoId
            },
            headers: {
                "x-rapidapi-key": process.env.RAPID_API_KEY,
                "x-rapidapi-host": "yt-api.p.rapidapi.com"
            }
        } as const;

        const res = await axios.request(options);

        return {
            length: res.data.lengthSeconds,
            subtitlesURL: res.data.subtitles.subtitles.find(
                (subtitle: { languageCode: string }) => subtitle.languageCode === 'en')?.url || null
        };
    } catch (error) {
        console.error(error);
        throw new Error('Failed to get video length and subtitles');
    }
}

export async function CreateTitleAndDescription(transcript: string): Promise<TitleDescription> {
    const promptTemplate = `
        Generate a title and description for this Powerpoint presentation based on the following transcript. 
        Requirements: 
        - Title should be fewer than 20 words 
        - description should be fewer than 35 words 
        - Focus on content rather than speaker 
        - make sure the output is in English 

        Transcript: ${transcript}
    `;

    try {
        const completion = await openai.beta.chat.completions.parse({
            messages: [
                {
                    role: 'system',
                    content: "You are a helpful assistant designed to generate titles and descriptions",
                },
                {
                    role: 'user',
                    content: promptTemplate
                }
            ],
            model: 'gpt-4o-mini',
            response_format: zodResponseFormat(TitleAndDescriptionSchema, "title")
        });

        const res = completion.choices[0].message?.parsed;

        if(!res) {
            throw new Error('Failed to generate title and description');
        };

        return res
    } catch (error) {
        console.error(error);
        throw new Error('Failed to generate title and description');
    }
}

export async function ConvertToObjects(text: string, slideCount = 10): Promise<SlideContent[] | null> {
    const promptTemplate = `
        Condense and tidy up the following text to make it suitable for a Powerpoint presentation. Transform it 
        into an array of objects. I have provided the schema for the output. Make sure that the content array has between 3 and 4 items, 
        and each content string should be between 160 and 170 characters. You can add to the content based on the transcript.. 
        The length of the array should be ${slideCount}.
        The text to process is as follows: ${text}
    `;

    try {
        const completion = await openai.beta.chat.completions.parse({
            messages: [
                {
                    role: 'system',
                    content: "You are a helpful assistant designed to convert text into objects. You output JSON based on a schema I provide.",
                },
                {
                    role: 'user',
                    content: promptTemplate
                }
            ],
            model: 'gpt-4o-mini',
            response_format: zodResponseFormat(arrayOfObjectsSchema, 'arrayOfObjects')
        });

        const res = completion.choices[0].message?.parsed;

        if(!res) {
            throw new Error('Failed to convert text to objects');
        };

        return res.arrayOfObjects;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to convert text to objects');
    }
}

export async function CreatePowerpointFromArrayOfObjects(
    titleAndDescription: TitleDescription,
    slides: SlideContent[],
    userId: string
) {
    const pptx = new pptxgen();

    const titleSlide = pptx.addSlide();
    titleSlide.background = { color: '#ffffff' };

    titleSlide.addText(titleAndDescription.title, {
        x: 0,
        y: "40%",
        w: "100%",
        h: 1,
        fontSize: 33,
        bold: true,
        color: "003366",
        align: "center",
        fontFace: "Helvetica",
    });

    titleSlide.addText(titleAndDescription.description, {
        x: 0,
        y: "58%",
        w: "100%",
        h: 0.75,
        fontSize: 18,
        color: "888888",
        align: "center",
        fontFace: "Helvetica",
    });

    slides.forEach(({ title, content }) => {
        const slide = pptx.addSlide();
        slide.addText(title, {
            x: 0.5,
            y: 0.5,
            w: 8.5,
            h: 1,
            fontSize: 32,
            bold: true,
            color: "003366",
            align: "center",
            fontFace: "Arial",
        });

        content.forEach((bullet, index) => {
            slide.addText(bullet, {
                x: 1,
                y: 1.8 + index * 1,
                w: 8,
                h: 0.75,
                fontSize: 15,
                color: "333333",
                align: "left",
                fontFace: "Arial",
                bullet: true,
            })
        });
    });

    try {
        const fileName = `presentation-${randomUUID()}-userId=${userId}.pptx`;
        const filePath = path.join('/tmp', fileName);

        await pptx.writeFile({ fileName: filePath });

        return { fileName, filePath };
    } catch (error) {
        console.error(error);
        throw new Error('Failed to create Powerpoint presentation');
    }
}