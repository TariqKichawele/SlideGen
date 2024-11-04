import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import MaxWidthWrapper from "@/components/common/MaxWidthWrapper";
import Link from "next/link";

export default function Home() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
      <MaxWidthWrapper>
        <div className="grid lg:grid-cols-2 items-center">
          <div className="lg:text-left text-center">
            <h1 className="mb-6 text-4xl font-black leading-tight text-gray-900 lg:text-6xl">
              Generate educational{" "}
              <span className="text-violet-600">Powerpoints</span> from YouTube
              videos.
            </h1>
            <p className="mb-9 text-lg text-gray-600">
              An online tool for teachers that allows you to convert educational
              YouTube videos into engaging presentations.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href="/"
                className={buttonVariants({
                  className: "w-full sm:w-auto",
                })}
              >
                Get started
              </Link>
              <Link
                href="/"
                className={buttonVariants({
                  variant: "secondary",
                  className: "w-full sm:w-auto",
                })}
              >
                Generate Powerpoint
              </Link>
            </div>
          </div>
          <div>
            <Card className="overflow-hidden shadow-2xl">
              <Image
                src="/lecture-1.jpg"
                className="w-full h-auto object-cover"
                alt="hero image"
                width={600}
                height={600}
              />
            </Card>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
