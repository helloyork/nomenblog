import withMDX from '@next/mdx';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkPrism from 'remark-prism';

export default withMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkPrism],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
  },
})({
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
});
