"use server";

import { AppRes, AppResStatus } from "./appReq";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type Blog = {
    title: string;
    date: string;
    href: string;
    preview?: string;
    frontmatter?: any;
};

// Extract preview text from MDX content (first paragraph)
function extractPreview(content: string, maxLength: number = 150): string {
    // Remove frontmatter and get content
    const lines = content.split('\n');
    let contentStart = 0;
    
    // Skip frontmatter if present
    if (lines[0]?.trim() === '---') {
        const endIndex = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
        contentStart = endIndex > 0 ? endIndex + 1 : 0;
    }
    
    // Find first paragraph (skip headers)
    for (let i = contentStart; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('#') && !line.startsWith('---') && !line.startsWith(':::')) {
            // Clean markdown formatting
            const cleaned = line
                .replace(/[#*_`]/g, '') // Remove markdown formatting
                .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Convert links to text
                .trim();
            
            if (cleaned.length > 0) {
                return cleaned.length > maxLength 
                    ? cleaned.substring(0, maxLength) + '...'
                    : cleaned;
            }
        }
    }
    
    return 'No preview available';
}

// Get modification date from file stats
function getFileDate(filePath: string): string {
    try {
        const stats = fs.statSync(filePath);
        return stats.mtime.toISOString().split('T')[0]; // Get YYYY-MM-DD format
    } catch (error) {
        return new Date().toISOString().split('T')[0];
    }
}

// Scan MDX files in the content directory
async function scanMdxFiles(): Promise<Blog[]> {
    const contentDir = path.join(process.cwd(), 'app/blog/content');
    const blogs: Blog[] = [];
    
    try {
        const items = fs.readdirSync(contentDir, { withFileTypes: true });
        
        for (const item of items) {
            if (item.isDirectory()) {
                const mdxPath = path.join(contentDir, item.name, 'page.mdx');
                
                if (fs.existsSync(mdxPath)) {
                    try {
                        const fileContent = fs.readFileSync(mdxPath, 'utf-8');
                        const { data: frontmatter, content } = matter(fileContent);
                        
                        // Extract title from frontmatter or from first h1
                        let title = frontmatter.title;
                        if (!title) {
                            const titleMatch = content.match(/^#\s+(.+)$/m);
                            title = titleMatch ? titleMatch[1].trim() : item.name;
                        }
                        
                        // Extract date from frontmatter or file stats
                        let date = frontmatter.date;
                        if (!date) {
                            date = getFileDate(mdxPath);
                        } else if (typeof date === 'object' && date instanceof Date) {
                            date = date.toISOString().split('T')[0];
                        } else if (typeof date === 'string') {
                            // Ensure date is in YYYY-MM-DD format
                            const dateObj = new Date(date);
                            date = dateObj.toISOString().split('T')[0];
                        }
                        
                        // Extract preview
                        const preview = extractPreview(content);
                        
                        blogs.push({
                            title,
                            date,
                            href: item.name,
                            preview,
                            frontmatter
                        });
                    } catch (error) {
                        console.error(`Error processing ${mdxPath}:`, error);
                    }
                }
            }
        }
        
        // Sort by date (newest first)
        blogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        return blogs;
    } catch (error) {
        console.error('Error scanning MDX files:', error);
        return [];
    }
}

export async function getBlogList(offset: number = 0, limit: number = 10): Promise<AppRes<Blog[], AppResStatus>> {
    if (offset < 0 || limit < 0 || limit > 20) return {
        status: "error",
        data: null,
        error: "Invalid offset or limit."
    };
    
    try {
        const allBlogs = await scanMdxFiles();
        const paginatedBlogs = allBlogs.slice(offset, offset + limit);
        
        return {
            status: "success",
            data: paginatedBlogs,
            error: null
        };
    } catch (error) {
        return {
            status: "error",
            data: null,
            error: "Failed to scan blog files: " + (error as Error).message
        };
    }
}


