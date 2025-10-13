import { getLastRenderableMarkdown } from './markdownParser'

describe('getLastRenderableMarkdown', () => {
  describe('empty and complete text', () => {
    const testPairs = [
      ['', ''],
      ['Hello world', 'Hello world'],
      ['This is **bold** text', 'This is **bold** text'],
      ['This is *italic* text', 'This is *italic* text'],
    ]

    test.each(testPairs)('should handle: %s', (input, expected) => {
      expect(getLastRenderableMarkdown(input)).toBe(expected)
    })
  })

  describe('bold text', () => {
    const testPairs = [
      ['This is **bold', 'This is'],
      ['This is *', 'This is'],
      ['This is **bold**', 'This is **bold**'],
      ['**First** and *', '**First** and'],
      ['**First** and **second', '**First** and'],
      ['**First** and **second**', '**First** and **second**'],
    ]

    test.each(testPairs)('should handle: %s', (input, expected) => {
      expect(getLastRenderableMarkdown(input)).toBe(expected)
    })
  })

  describe('italic text', () => {
    const testPairs = [
      ['This is *italic', 'This is'],
      ['This is *italic*', 'This is *italic*'],
      ['**bold *italic* bold**', '**bold *italic* bold**'],
    ]

    test.each(testPairs)('should handle: %s', (input, expected) => {
      expect(getLastRenderableMarkdown(input)).toBe(expected)
    })
  })

  describe('code blocks', () => {
    const testPairs = [
      ['```javascript', ''],
      ['```javascript\nconst x = 1', '```javascript\nconst x = 1'],
      ['```javascript\nconst x = 1\n```', '```javascript\nconst x = 1\n```'],
      ['```typescript\nfunction test() {\n  return true\n}\n```', '```typescript\nfunction test() {\n  return true\n}\n```'],
      ['Some text\n```javascript\nconst x = 1\n```', 'Some text\n```javascript\nconst x = 1\n```'],
      ['Line 1\nLine 2\n```javascript\nconst x = 1', 'Line 1\nLine 2'],
    ]

    test.each(testPairs)('should handle code blocks', (input, expected) => {
      expect(getLastRenderableMarkdown(input)).toBe(expected)
    })
  })

  describe('inline code', () => {
    const testPairs = [
      ['This has `code', ''],
      ['This has `code`', 'This has `code`'],
      ['This has `', ''],
      ['This has ``', ''],
      ['Use the `function()` method', 'Use the `function()` method'],
    ]

    test.each(testPairs)('should handle: %s', (input, expected) => {
      expect(getLastRenderableMarkdown(input)).toBe(expected)
    })
  })

  describe('links', () => {
    const testPairs = [
      ['This is a [link', ''],
      ['This is a [link]', ''],
      ['This is a [link](', ''],
      ['This is a [link](https://', ''],
      ['This is a [link](https://example.com)', 'This is a [link](https://example.com)'],
      ['[First](url1) and [Second](url2)', '[First](url1) and [Second](url2)'],
      ['First line\nSecond line [incomplete', 'First line'],
    ]

    test.each(testPairs)('should handle: %s', (input, expected) => {
      expect(getLastRenderableMarkdown(input)).toBe(expected)
    })
  })

  describe('images', () => {
    const testPairs = [
      ['![image', ''],
      ['![image]', ''],
      ['![image](', ''],
      ['![alt text](image.png)', '![alt text](image.png)'],
    ]

    test.each(testPairs)('should handle: %s', (input, expected) => {
      expect(getLastRenderableMarkdown(input)).toBe(expected)
    })
  })

  describe('headers', () => {
    const testPairs = [
      ['# ', ''],
      ['#', ''],
      ['# Title', '# Title'],
      ['### Subsection', '### Subsection'],
    ]

    test.each(testPairs)('should handle: %s', (input, expected) => {
      expect(getLastRenderableMarkdown(input)).toBe(expected)
    })
  })

  describe('lists', () => {
    const testPairs = [
      ['- ', ''],
      ['1. ', ''],
      ['- Item', '- Item'],
      ['1. First item', '1. First item'],
      ['- First\n- Second\n- Third', '- First\n- Second\n- Third'],
      ['- First\n- Second\n- ', '- First\n- Second'],
    ]

    test.each(testPairs)('should handle: %s', (input, expected) => {
      expect(getLastRenderableMarkdown(input)).toBe(expected)
    })
  })

  describe('blockquotes', () => {
    const testPairs = [
      ['> ', ''],
      ['> This is a quote', '> This is a quote'],
      ['> First line\n> Second line', '> First line\n> Second line'],
    ]

    test.each(testPairs)('should handle: %s', (input, expected) => {
      expect(getLastRenderableMarkdown(input)).toBe(expected)
    })
  })

  describe('complex combinations', () => {
    const testPairs = [
      ['This is ***bold and italic*** text', 'This is ***bold and italic*** text'],
      ['**Bold with `code`**', '**Bold with `code`**'],
      ['**[Link](url)**', '**[Link](url)**'],
      ['This has **bold and [link', ''],
    ]

    test.each(testPairs)('should handle complex markdown', (input, expected) => {
      expect(getLastRenderableMarkdown(input)).toBe(expected)
    })

    it('should handle real-world markdown', () => {
      const markdown = `# Title

This is **bold** and *italic* text.

## Subtitle

- First item
- Second item

\`\`\`javascript
const x = 1
\`\`\`

[Link](https://example.com)`
      expect(getLastRenderableMarkdown(markdown)).toBe(markdown)
    })

    it('should return safe portion for incomplete markdown', () => {
      const markdown = `# Title

This is **bold** and *italic* text.

## Subtitle

- First item
- Second item

\`\`\`javascript
const x = 1`
      expect(getLastRenderableMarkdown(markdown)).toBe(`# Title

This is **bold** and *italic* text.

## Subtitle

- First item
- Second item`)
    })
  })

  describe('edge cases', () => {
    const testPairs = [
      ['***', ''],
      ['```', ''],
      ['Line 1\n\n\nLine 4', 'Line 1\n\n\nLine 4'],
      ['Text with @#$%^&*()', 'Text with @#$%^&*()'],
      ['Hello 🎉 World', 'Hello 🎉 World'],
      ['Hello 世界', 'Hello 世界'],
      ['This is **bold', ''],
      ['Line 1\nLine 2\nLine 3 **bold', 'Line 1\nLine 2'],
    ]

    test.each(testPairs)('should handle: %s', (input, expected) => {
      expect(getLastRenderableMarkdown(input)).toBe(expected)
    })
  })
})
