"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface BlogTitleSetterProps {
    blogData: {
        title: string;
        description?: string;
    } | null;
}

export default function BlogTitleSetter({ blogData }: BlogTitleSetterProps) {
    const pathname = usePathname();
    
    useEffect(() => {
        if (blogData?.title) {
            // Set the document title
            document.title = `${blogData.title} - Nomen Blog`;
            
            // Update meta description if available
            if (blogData.description) {
                let metaDescription = document.querySelector('meta[name="description"]');
                if (!metaDescription) {
                    metaDescription = document.createElement('meta');
                    metaDescription.setAttribute('name', 'description');
                    document.head.appendChild(metaDescription);
                }
                metaDescription.setAttribute('content', blogData.description);
            }
        }
    }, [blogData, pathname]);
    
    return null; // This component doesn't render anything visible
}