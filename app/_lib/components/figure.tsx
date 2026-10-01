/* eslint-disable @next/next/no-img-element */

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
        <figure className="n-fig">
            <a href={src} target="_blank" rel="noreferrer">
                <img src={src} alt={alt} loading="lazy" />
            </a>
            {caption && <figcaption>{caption}</figcaption>}
        </figure>
    );
}
