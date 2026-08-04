"use client";

type Shot = {
    src: string;
    alt: string;
    caption?: string;
};

/**
 * Two screenshots side by side. Portrait shots would otherwise fill a whole
 * screen each, so every image is capped by maxHeight and shrinks to fit rather
 * than stretching to the column width.
 */
export default function ImagePair({
    left,
    right,
    maxHeight = "60vh",
}: {
    left: Shot;
    right: Shot;
    maxHeight?: string;
}) {
    return (
        <div className="my-6 flex flex-col gap-4 sm:flex-row sm:items-start">
            {[left, right].map((shot) => (
                <figure key={shot.src} className="m-0 flex min-w-0 flex-1 flex-col">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={shot.src}
                        alt={shot.alt}
                        className="mx-auto rounded-lg border border-gray-700"
                        style={{ maxHeight, maxWidth: "100%", width: "auto" }}
                    />
                    {shot.caption && (
                        <figcaption className="mt-2 text-center text-sm text-gray-400">
                            {shot.caption}
                        </figcaption>
                    )}
                </figure>
            ))}
        </div>
    );
}
