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
        <div className="my-6">
            <div
                className="relative w-full overflow-hidden rounded-lg border border-gray-700"
                style={{ aspectRatio: "16 / 9" }}
            >
                <iframe
                    className="absolute inset-0 h-full w-full"
                    src={`https://player.bilibili.com/player.html?${params.toString()}`}
                    title={title ?? "Bilibili video"}
                    allowFullScreen
                    scrolling="no"
                    frameBorder="0"
                />
            </div>
            {title && <p className="mt-2 text-sm text-gray-400">{title}</p>}
        </div>
    );
}
