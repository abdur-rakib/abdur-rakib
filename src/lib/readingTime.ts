const WORDS_PER_MINUTE = 200

/**
 * Estimate reading time in minutes from a post body. Markup and code fences are
 * stripped first so syntax tokens (#, ```, HTML tags) don't inflate the count.
 */
export function estimateReadingMinutes(content: string, format: 'markdown' | 'html'): number {
  let text = content

  if (format === 'html') {
    text = text.replace(/<[^>]+>/g, ' ')
  } else {
    text = text
      .replace(/```[\s\S]*?```/g, ' ') // fenced code blocks
      .replace(/`[^`]*`/g, ' ') // inline code
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // links/images -> label
      .replace(/[#>*_~`]/g, ' ') // remaining markdown markers
  }

  const words = text
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean).length

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}
