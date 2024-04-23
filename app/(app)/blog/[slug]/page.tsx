
import { getBlog } from "@/app/_lib/data/blogs";
import PageDrawer from "./page-drawer";

export default async function Page({ params }: { params: { slug: string } }) {
    let data = await getBlog(params.slug);
    return (
        <PageDrawer data={data} />
    );
}

