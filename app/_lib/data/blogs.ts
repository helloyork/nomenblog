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
    "hello-world": {
        title: "Hello World!",
        href: "hello-world",
        date: "2024-04-23",
        content: `# Hello World!  

hi, this is my first blog post.

## What is this blog about?

This blog is about my journey as a developer. I will be sharing my experiences, projects, and thoughts on various topics related to software development.

## Why did I start this blog?

I started this blog to document my journey and share my knowledge with others. I hope that my blog posts will help others who are also learning to code.

## What can you expect from this blog?

You can expect to see blog posts about my projects, tutorials, and tips on software development. I will also be sharing my thoughts on various topics related to programming.

I hope you enjoy reading my blog posts!

> u know wat? this website has many hidden features. try to find them all. :)  
> don't forget to try dark mode 💡`
    },
    "markdown-syntax-guide": {
        title: "Markdown Syntax Guide",
        href: "markdown-syntax-guide",
        date: "2024-04-22",
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


