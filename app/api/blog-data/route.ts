import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    if (!slug) {
        return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }
    
    try {
        const mdxPath = path.join(process.cwd(), 'app/blog/content', slug, 'page.mdx');
        
        if (!fs.existsSync(mdxPath)) {
            return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
        }
        
        const fileContent = fs.readFileSync(mdxPath, 'utf-8');
        const { data: frontmatter, content } = matter(fileContent);
        
        // Extract title from frontmatter or from first h1
        let title = frontmatter.title;
        if (!title) {
            const titleMatch = content.match(/^#\s+(.+)$/m);
            title = titleMatch ? titleMatch[1].trim() : slug;
        }
        
        const blogData = {
            title,
            description: frontmatter.description || `Read ${title} on Nomen Blog`,
            date: frontmatter.date,
            slug
        };
        
        return NextResponse.json(blogData);
    } catch (error) {
        console.error('Error fetching blog data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}