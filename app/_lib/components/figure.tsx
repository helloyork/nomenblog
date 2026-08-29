"use client";

/**
 * A single wide image with a caption. The comparison strips only mean anything
 * at 1:1, and they are far wider than the column, so the image links to itself
 * — clicking opens the full-resolution file.
 */
export default function Figure({
    src,
    alt,
    caption,
}: {
    src: string;
    alt: string;
    caption?: string;
}) {
    return (
        <figure className="my-6 m-0">
            <a href={src} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={src}
                    alt={alt}
                    className="w-full rounded-lg border border-gray-700"
                />
            </a>
            {caption && (
                <figcaption className="mt-2 text-center text-sm text-gray-400">
                    {caption}
                </figcaption>
            )}
        </figure>
    );
}
