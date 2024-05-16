import { Blog } from "./blogs";

export const Blogs: Record<string, Blog> = {
    "aiapa-v0-1-13": {
        title: "AIAPA v0.1.13",
        href: "aiapa-v0-1-13",
        date: "2024-5-15",
        content: `# AIAPA - AI Analysis of Products on Amazon

AIAPA is a Gemini-driven Amazon product analysis tool currently in the development stage. Although it still needs to be improved, we welcome any problems or suggestions encountered through issues.

**This tool can result in a short soft ban and a permanent ban! Please consider carefully before using it and set a reasonable task volume!**

The main function:  
Use the get command to obtain product data Use the analyze command to summarize the advantages and disadvantages of the product  
generate product report

github: [https://github.com/helloyork/aiapa](https://github.com/helloyork/aiapa)

npm: [https://www.npmjs.com/package/aiapa](https://www.npmjs.com/package/aiapa)

# Quick Start

1. Install [nodejs](https://nodejs.org/en/download/)
2. Go to [Google AI Studio](https://makersuite.google.com/app/apikey) and get an API Key
3. type in \`npm install aiapa -g\` in terminal
4. type \`aiapa start\` and enjoy :)

AIAPA can be started from the command line or through a code interface, and supports passing in parameters, calling commands, listening to events, and more.

start with:

    aiapa start

or chat(beta) with Gemini

    aiapa chat
    
> Reddit: [https://www.reddit.com/user/HelloYork/comments/1ct5emk/aiapa_ai_analysis_of_products_on_amazon_v0113/](AIAPA - AI Analysis of Products on Amazon v0.1.13)`
    },
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