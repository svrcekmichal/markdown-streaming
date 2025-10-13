import { useState, useEffect, useCallback } from 'react'
import { marked } from 'marked'
import './MarkdownStreaming.css'
import { getLastRenderableMarkdown } from '../utils/markdownParser'

// Test markdown content to simulate streaming
const TEST_MARKDOWN = `# Welcome to Markdown Streaming

This is a demonstration of **streaming markdown** content without breaking the layout.

## How it works

The key is to **postpone rendering** of incomplete markdown tags until they are complete. This prevents:

- Broken HTML structure
- Layout shifts
- Visual glitches

### Features

1. **Bold text** and *italic text*
2. Lists (both ordered and unordered)
3. Code blocks with syntax highlighting
4. Links and images
5. Tables

#### Example Code Block

\`\`\`typescript
function streamMarkdown(text: string) {
  return text
    .split('')
    .reduce((acc, char) => acc + char, '')
}
\`\`\`

##### Example List

- First item
- Second item
  - Nested item
  - Another nested item
- Third item

###### Example Table

| Feature | Status | Priority |
|---------|--------|----------|
| Streaming | ✅ Done | High |
| **Layout Stability** | ✅ Done | High |
| Performance | ✅ Done | Medium |

> This is a blockquote demonstrating how quoted text looks in markdown.

Here's some \`inline code\` for you to see.

And here's a [link to example.com](https://example.com).

---

**End of streaming demo!** 🎉`

function MarkdownStreaming() {
  const [displayedText, setDisplayedText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamSpeed, setStreamSpeed] = useState(50) // milliseconds per character

  // Simulate streaming by adding characters one by one
  const startStreaming = useCallback(() => {
    setIsStreaming(true)
    setDisplayedText('')
    
    let currentIndex = 0
    
    const interval = setInterval(() => {
      if (currentIndex < TEST_MARKDOWN.length) {
        currentIndex++
        const text = TEST_MARKDOWN.substring(0, currentIndex)
        
        // Get the last renderable version of the markdown
        const renderableText = getLastRenderableMarkdown(text)
        
        // Always update with the renderable portion
        setDisplayedText(renderableText)
      } else {
        // Make sure we display the final text
        setDisplayedText(TEST_MARKDOWN)
        clearInterval(interval)
        setIsStreaming(false)
      }
    }, streamSpeed)
    
    return () => clearInterval(interval)
  }, [streamSpeed])

  // Start streaming on mount
  useEffect(() => {
    startStreaming()
  }, [startStreaming])

  const handleReset = () => {
    setDisplayedText('')
    setTimeout(() => startStreaming(), 100)
  }

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStreamSpeed(Number(e.target.value))
  }

  // Convert markdown to HTML
  const getMarkdownHTML = (text: string) => {
    try {
      return marked(text)
    } catch (error) {
      return marked('Error rendering markdown')
    }
  }

  return (
    <div className="markdown-streaming">
      <div className="controls">
        <div className="control-group">
          <label htmlFor="speed">Stream Speed:</label>
          <input
            id="speed"
            type="range"
            min="10"
            max="200"
            value={streamSpeed}
            onChange={handleSpeedChange}
            disabled={isStreaming}
          />
          <span>{streamSpeed}ms/char</span>
        </div>
        <button onClick={handleReset} disabled={isStreaming}>
          {isStreaming ? 'Streaming...' : 'Restart Stream'}
        </button>
      </div>

      <div className="markdown-container">
        <div 
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: getMarkdownHTML(displayedText) }}
        />
        {isStreaming && (
          <span className="cursor">|</span>
        )}
      </div>

      <div className="info-panel">
        <h3>How it works:</h3>
        <ul>
          <li>Characters are added one by one to simulate streaming</li>
          <li>Incomplete markdown tags are detected and postponed</li>
          <li>Only complete markdown is rendered to prevent layout breaks</li>
          <li>Adjust the speed slider to see the effect at different rates</li>
        </ul>
      </div>
    </div>
  )
}

export default MarkdownStreaming
