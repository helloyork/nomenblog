import React, { JSX } from "react";
import type { SyntaxHighlighterProps } from 'react-syntax-highlighter';
import { Prism } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import dynamic from 'next/dynamic';

// Cast through unknown to satisfy JSX typing from react-syntax-highlighter.
const SyntaxHighlighter = Prism as unknown as React.ComponentType<SyntaxHighlighterProps>;

// Dynamically import MermaidChart with no SSR to avoid window undefined errors
const MermaidChart = dynamic(() => import('./mermaid-chart'), {
    ssr: false,
    loading: () => <div className="my-6 text-gray-400">Loading diagram...</div>,
});

type Props = JSX.IntrinsicAttributes;

const MDXComponents = {
    h1: (props: Props) =>
        <h1 className="text-5xl font-extrabold mt-12 mb-8 border-b border-gray-500 pb-3 text-white" {...props} />,
    h2: (props: Props) =>
        <h2 className="text-4xl font-bold mt-12 mb-6 text-gray-100" {...props} />,
    h3: (props: Props) =>
        <h3 className="text-3xl font-semibold mt-10 mb-4 text-gray-200" {...props} />,
    h4: (props: Props) =>
        <h4 className="text-2xl font-medium mt-8 mb-3 text-gray-200" {...props} />,
    h5: (props: Props) =>
        <h5 className="text-xl font-normal mt-6 mb-3 text-gray-300" {...props} />,
    h6: (props: Props) =>
        <h6 className="text-lg font-light mt-6 mb-2 text-gray-300" {...props} />,
    p: (props: Props) => 
        <p className="mb-4 text-lg leading-relaxed text-gray-300" {...props} />,
    a: (props: Props) => 
        <a className="text-blue-400 hover:text-blue-300 hover:underline" {...props} />,
    code: (props: Props) => 
        <code className="bg-gray-800 text-gray-100 rounded px-2 py-1 text-sm font-mono" {...props} />,
    // Tailwind's darkMode is "class" and nothing sets that class, so the old
    // `dark:` variants never applied and tables rendered as a white slab on the
    // dark page. These colours are unconditional, and comparison tables wider
    // than the column scroll inside their own frame instead of being squeezed.
    table: (props: Props) =>
        <div className="my-6 overflow-x-auto rounded-lg border border-gray-700">
            <table className="min-w-full border-collapse text-left" {...props} />
        </div>,
    thead: (props: Props) =>
        <thead className="bg-gray-800/70" {...props} />,
    tr: (props: Props) =>
        <tr className="border-b border-gray-800 last:border-b-0" {...props} />,
    th: (props: Props) =>
        <th className="whitespace-nowrap px-4 py-2.5 text-left text-sm font-semibold text-gray-200" {...props} />,
    td: (props: Props) =>
        <td className="px-4 py-2.5 align-top text-sm text-gray-300" {...props} />,
    ul: (props: Props) => 
        <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
    ol: (props: Props) => 
        <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
    li: (props: Props) => 
        <li className="leading-relaxed" {...props} />,
    blockquote: (props: Props) => 
        <blockquote className="border-l-4 border-gray-400 pl-4 my-4 italic text-gray-400 bg-gray-900/50 py-2 rounded-r" {...props} />,
    pre: (props: any) => {
        // Extract language from className if present
        const extractText = (node: any): string => {
            if (typeof node === 'string') return node;
            if (Array.isArray(node)) return node.map(extractText).join('');
            if (React.isValidElement(node)) {
                // props may be unknown
                const childrenAny = (node as any).props?.children;
                return extractText(childrenAny);
            }
            return '';
        };

        const codeElementRaw = props.children?.props?.children;
        const codeText = extractText(codeElementRaw);
        const className = props.children?.props?.className || '';
        const language = className.replace('language-', '') || 'text';
        
        // Mermaid handling first to avoid Prism rendering interference
        if (language === 'mermaid') {
            if (codeText) {
                return (
                    <div className="my-6">
                        <MermaidChart chart={codeText.trim()} />
                    </div>
                );
            }
        }

        if (typeof codeText === 'string') {
            return (
                <div className="my-6">
                    <SyntaxHighlighter
                        language={language}
                        style={oneDark}
                        customStyle={{
                            borderRadius: '0.5rem',
                            border: '1px solid #374151',
                            fontSize: '0.875rem',
                        }}
                        {...props}
                    >
                        {codeText}
                    </SyntaxHighlighter>
                </div>
            );
        }
        return (
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto my-6 border border-gray-700" {...props} />
        );
    },
    inlineCode: (props: Props) => 
        <code className="bg-gray-800 text-gray-100 rounded px-1 py-0.5 text-sm font-mono" {...props} />,
};

export default MDXComponents;