# Markdown Parser Utility

This directory contains the isolated markdown parsing logic used for streaming markdown rendering.

## Files

- **`markdownParser.ts`** - Core utility function that checks if markdown text is complete
- **`markdownParser.test.ts`** - Comprehensive test suite for the parser

## Function: `getLastRenderableMarkdown`

The `getLastRenderableMarkdown` function analyzes markdown text and returns the last complete, renderable portion. This is used to postpone rendering of incomplete markdown tags until they are complete, preventing broken HTML structure and layout shifts during streaming.

### Features

- Detects incomplete bold (`**text`), italic (`*text`), and code (`\`code`) tags
- Handles code blocks with triple backticks
- Validates links and images
- Checks for incomplete headers, lists, and blockquotes
- Returns only the safe-to-render portion of the markdown
- Returns empty string if the entire text is incomplete

### Usage

```typescript
import { getLastRenderableMarkdown } from './utils/markdownParser'

// Incomplete markdown - returns empty string
const incompleteText = 'This is **bold'
const renderable = getLastRenderableMarkdown(incompleteText) // ''

// Complete markdown - returns the full text
const completeText = 'This is **bold**'
const renderable2 = getLastRenderableMarkdown(completeText) // 'This is **bold**'

// Multi-line with incomplete last line - returns previous lines
const multiLine = 'Line 1\nLine 2\nLine 3 **bold'
const renderable3 = getLastRenderableMarkdown(multiLine) // 'Line 1\nLine 2'
```

## Running Tests

To run the tests, first install dependencies:

```bash
npm install
```

Then run the test suite:

```bash
npm test
```

Or run in watch mode:

```bash
npm run test:watch
```

## Test Coverage

The test suite covers:
- Empty and complete text
- Bold and italic formatting
- Code blocks and inline code
- Links and images
- Headers, lists, and blockquotes
- Complex combinations of markdown elements
- Edge cases (emoji, unicode, special characters)

