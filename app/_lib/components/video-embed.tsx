"use client";

export default function BilibiliEmbed({
    bvid,
    aid,
    cid,
    title,
}: {
    bvid: string;
    aid?: string | number;
    cid?: string | number;
    title?: string;
}) {
    const params = new URLSearchParams({ isOutside: "true", bvid, p: "1", autoplay: "0" });
    if (aid !== undefined) params.set("aid", String(aid));
    if (cid !== undefined) params.set("cid", String(cid));

    return (
        <figure className="n-fig">
            <div className="n-video">
                <iframe
                    src={`https://player.bilibili.com/player.html?${params.toString()}`}
                    title={title ?? "Bilibili video"}
                    allowFullScreen
                    scrolling="no"
                    frameBorder="0"
                />
            </div>
            {title && <figcaption>{title}</figcaption>}
        </figure>
    );
}
