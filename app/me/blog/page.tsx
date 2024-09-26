

import Title from "@lib/elements/title";
import BlogDrawer from "./blog-drawer";
import { Suspense } from "react";


export default async function Page() {
    return (
        <>
            <Title title="Blogs" subtitle="My Blogs" />
            <div className="text-left dark:bg-transparent bg-white">
                <Suspense fallback={<div>Loading...</div>}>
                    <BlogDrawer />
                </Suspense>
            </div>
        </>
    );
}

