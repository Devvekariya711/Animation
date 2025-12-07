---
description: Run automated tests with TestSprite MCP after major task completion
---

# TestSprite Testing Workflow

Use this workflow after completing major tasks to run automated testing.

## Prerequisites
- TestSprite MCP configured in `.agent/mcp.json`
- Project code in `src/` directory

## Steps

1. Ensure the development server is running (if testing browser code):
```powershell
npm run dev
```

2. Ask TestSprite to generate and run tests:
> "Help me test this project with TestSprite. Focus on [specific feature or file]."

3. Review test results and fix any failures

4. Update the testing checkpoints in `doc/task.md`

## Common Test Requests

### Phase 1 Tests
- "Test the Three.js scene rendering in scene.js"
- "Test the face tracking initialization in tracker.js"
- "Test the parallax math calculations in parallax.js"

### Phase 2 Tests
- "Test video synchronization across layers"
- "Test the video loading pipeline"

### Phase 3 Tests
- "Test API endpoints for video upload"
- "Test database operations"

### Phase 4 Tests
- "Test gyroscope fallback functionality"
- "Test haptic feedback timing"
