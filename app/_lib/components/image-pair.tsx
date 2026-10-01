/* eslint-disable @next/next/no-img-element */

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
        <div className="n-pair">
            {[left, right].map((shot) => (
                <figure key={shot.src} className="n-fig">
                    <img src={shot.src} alt={shot.alt} loading="lazy" style={{ maxHeight, maxWidth: "100%", width: "auto", margin: "0 auto" }} />
                    {shot.caption && <figcaption>{shot.caption}</figcaption>}
                </figure>
            ))}
        </div>
    );
}
