"use client";

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import BlogTitleSetter from './blog-title-setter';
import { MDXProvider } from '@mdx-js/react';
import MDXComponents from '../../_lib/components/mdx-components';

interface BlogData {
    title: string;
    description?: string;
    date?: string;
    slug?: string;
}

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    const pathname = usePathname();
    const [blogData, setBlogData] = useState<BlogData | null>(null);
    
    useEffect(() => {
        // Extract slug from pathname and fetch blog data
        const pathParts = pathname.split('/');
        const slug = pathParts[pathParts.length - 1];
        
        if (slug && slug !== 'content') {
            // Since we can't use server actions directly in useEffect,
            // we'll create a client-side function to fetch the blog data
            fetchBlogData(slug).then(setBlogData);
        }
    }, [pathname]);
    
    return (
        <div className="max-w-screen-lg mx-auto">
            <BlogTitleSetter blogData={blogData} />
            <MDXProvider components={MDXComponents}>
                {children}
            </MDXProvider>
        </div>
    );
}

// Client-side function to fetch blog data
async function fetchBlogData(slug: string): Promise<BlogData | null> {
    try {
        const response = await fetch(`/api/blog-data?slug=${slug}`);
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Error fetching blog data:', error);
    }
    return null;
}

