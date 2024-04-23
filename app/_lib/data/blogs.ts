"use server";

import { AppRes, AppResStatus } from "./appReq";

export type Blog = {
    title: string;
    date: string;
    href: string;
    content: string;
};

function toSeoFriendly(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

const Blogs: Record<string, Blog> = {
    "test-blog": {
        title: "Test Blog",
        href: "test-blog",
        date: "2021-07-01",
        content: `This is a test blog.  
        hello, \`world\`!`
    },
    "markdown-syntax-guide": {
        title: "Markdown Syntax Guide",
        href: "markdown-syntax-guide",
        date: "2023-08",
        content: `# Markdown syntax guide

## Headers

# This is a Heading h1
## This is a Heading h2
###### This is a Heading h6

## Emphasis

*This text will be italic*  
_This will also be italic_

**This text will be bold**  
__This will also be bold__

_You **can** combine them_

## Lists

### Unordered

* Item 1
* Item 2
* Item 2a
* Item 2b

### Ordered

1. Item 1
2. Item 2
3. Item 3
    1. Item 3a
    2. Item 3b

## Images

![This is an alt text.](/image/sample.webp "This is a sample image.")

## Links

You may be using [Markdown Live Preview](https://markdownlivepreview.com/).

## Blockquotes

> Markdown is a lightweight markup language with plain-text-formatting syntax, created in 2004 by John Gruber with Aaron Swartz.
>
>> Markdown is often used to format readme files, for writing messages in online discussion forums, and to create rich text using a plain text editor.

## Tables

| Left columns  | Right columns |
| ------------- |:-------------:|
| left foo      | right foo     |
| left bar      | right bar     |
| left baz      | right baz     |

## Blocks of code

\`\`\`
let message = 'Hello world';
alert(message);
\`\`\`

## Inline code

This web site is using \`markedjs/marked\`.
`
    },
};

export async function getBlog(slug: string): Promise<AppRes<Blog|undefined, AppResStatus>> {
    return {
        status: "success",
        data: Blogs[slug],
        error: null
    };
}

export async function getBlogList(offset: number = 0, limit: number = 10): Promise<AppRes<Blog[], AppResStatus>> {
    if (offset < 0 || limit < 0 || limit > 20) return {
        status: "error",
        data: null,
        error: "Invalid offset or limit."
    };
    return {
        status: "success",
        data: Object.keys(Blogs).map((slug) => ({
            ...Blogs[slug],
            content: Blogs[slug].content.substring(0, 360)
        })).slice(offset, offset + limit),
        error: null
    };
}


