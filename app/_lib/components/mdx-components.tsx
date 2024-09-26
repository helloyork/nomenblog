import { JSX, ClassAttributes, HTMLAttributes } from "react";

type Props = JSX.IntrinsicAttributes;

const MDXComponents = {
    h1: (props: Props) =>
        <h1 className="text-4xl font-extrabold mt-6 mb-6 border-b border-gray-500 pb-2" {...props} />,
    h2: (props: Props) =>
        <h2 className="text-3xl font-bold mt-4" {...props} />,
    h3: (props: Props) =>
        <h3 className="text-2xl font-semibold mt-2" {...props} />,
    h4: (props: Props) =>
        <h4 className="text-xl font-medium" {...props} />,
    h5: (props: Props) =>
        <h5 className="text-lg font-normal" {...props} />,
    h6: (props: Props) =>
        <h6 className="text-base font-light" {...props} />,
    p: (props: Props) => 
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300" {...props} />,
    a: (props: Props) => 
        <a className="text-blue-500 hover:underline" {...props} />,
    code: (props: Props) => 
        <code className="bg-gray-100 rounded px-2 py-1" {...props} />,
    table: (props: Props) => 
        <table className="min-w-full bg-white dark:bg-gray-800" {...props} />,
    tr: (props: Props) => 
        <tr className="border-b border-gray-200 dark:border-gray-700" {...props} />,
    th: (props: Props) => 
        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400" {...props} />,
    td: (props: Props) => 
        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300" {...props} />,
    ul: (props: Props) => 
        <ul className="list-disc list-inside" {...props} />,
    ol: (props: Props) => 
        <ol className="list-decimal list-inside" {...props} />,
    li: (props: Props) => 
        <li className="mt-1" {...props} />,
    blockquote: (props: Props) => 
        <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 dark:text-gray-300" {...props} />,
    pre: (props: Props) => 
        <pre className="bg-gray-100 rounded p-4 overflow-x-auto" {...props} />,
    inlineCode: (props: Props) => 
        <code className="bg-gray-100 rounded px-1 py-0.5 dark:bg-gray-800" {...props} />,
};

export default MDXComponents;