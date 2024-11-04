'use server';

import axios from 'axios';

type VideoMetaData = {
    length: number | null;
    subtitlesURL: string | null;
}

export const CreatePowerpoint = async (videoId: string) => {

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