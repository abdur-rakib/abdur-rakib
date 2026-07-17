import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import type { Post } from '@/lib/types'

export function PostBody({ post }: { post: Post }) {
  if (post.contentFormat === 'html') {
    return (
      <div
        className="prose prose-neutral dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    )
  }

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <ReactMarkdown rehypePlugins={[rehypeSlug, rehypeHighlight]}>{post.content}</ReactMarkdown>
    </div>
  )
}
