/**
 * Returns the last renderable version of markdown text.
 * This function analyzes the markdown and returns only the portion that is
 * safe to render, preventing broken HTML structure and layout shifts during streaming.
 * 
 * @param text - The markdown text to analyze
 * @returns The last complete, renderable portion of the markdown text
 */
export function getLastRenderableMarkdown(text: string): string {
  // If text is empty, return it as is
  if (!text) return text
  
  const lines = text.split('\n')
  const lastLine = lines[lines.length - 1]
  
  // Count unclosed markdown tags
  let unclosedBold = 0
  let unclosedItalic = 0
  let unclosedCode = 0
  let unclosedLink = 0
  let unclosedImage = 0
  let unclosedCodeBlock = false
  let inLinkUrl = false  // Track if we're inside the URL part of a link
  
  // Track state through the line
  for (let i = 0; i < lastLine.length; i++) {
    const char = lastLine[i]
    const nextChar = lastLine[i + 1]
    const prevChar = lastLine[i - 1]
    
    // Bold **
    if (char === '*' && nextChar === '*' && prevChar !== '*') {
      unclosedBold = 1 - unclosedBold
      i++ // Skip next char
    }
    // Italic * (single asterisk, not part of **)
    else if (char === '*' && prevChar !== '*' && nextChar !== '*') {
      unclosedItalic = 1 - unclosedItalic
    }
    // Code block ``` (check this before inline code)
    else if (lastLine.substring(i, i + 3) === '```') {
      unclosedCodeBlock = !unclosedCodeBlock
      i += 2 // Skip next 2 chars
    }
    // Inline code ` (only if not inside a code block)
    else if (char === '`' && !unclosedCodeBlock) {
      unclosedCode = 1 - unclosedCode
    }
    // Link [
    else if (char === '[' && prevChar !== '!') {
      unclosedLink = 1 - unclosedLink
    }
    // Image ![
    else if (char === '[' && prevChar === '!') {
      unclosedImage = 1 - unclosedImage
    }
    // Closing ]
    else if (char === ']') {
      if (unclosedLink > 0) {
        if (nextChar === '(') {
          inLinkUrl = true
          unclosedLink--
          i++ // Skip the opening (
        }
        // If nextChar is NOT (, the link is incomplete (just [text] without (url))
        // Don't decrement unclosedLink, keep it as 1
      }
      if (unclosedImage > 0) {
        unclosedImage--
      }
    }
    // Closing ) - check if we're inside a link URL
    else if (char === ')' && inLinkUrl) {
      inLinkUrl = false
    }
  }
  
  // Check for incomplete line-level elements
  const incompleteLineEndings = [
    />\s*$/,                // Incomplete blockquote
    /^\s*[-*+]\s*$/,        // Incomplete list item
    /^\s*\d+\.\s*$/,        // Incomplete ordered list (with period)
    /^\s*\d+\s*$/,          // Incomplete ordered list (just number)
    /^#{1,6}\s*$/,          // Header with no text
  ]
  
  const hasIncompleteLine = incompleteLineEndings.some(pattern => pattern.test(lastLine))
  
  // Check if line ends with incomplete backticks (1 or 2 backticks without content)
  const backtickMatch = lastLine.match(/`+$/);
  const endsWithIncompleteBackticks = backtickMatch && 
    backtickMatch[0].length > 0 && 
    backtickMatch[0].length < 3;
  
  const isComplete = unclosedBold === 0 && 
         unclosedItalic === 0 && 
         unclosedCode === 0 && 
         unclosedLink === 0 && 
         unclosedImage === 0 && 
         !unclosedCodeBlock && 
         !hasIncompleteLine &&
         !endsWithIncompleteBackticks &&
         !inLinkUrl
  
  // If the text is complete, return it as is
  if (isComplete) {
    return text
  }
  
  // If incomplete, return everything except the last line
  // This ensures we only render complete lines
  if (lines.length > 1) {
    return lines.slice(0, -1).join('\n')
  }
  
  // If there's only one line and it's incomplete, return empty string
  return ''
}

