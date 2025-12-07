# TestSprite MCP Setup Guide

## Prerequisites
- Node.js v22 or higher (`node --version` to check)
- TestSprite API Key

---

## Step 1: Install TestSprite MCP Globally

```powershell
npm install -g @testsprite/testsprite-mcp@latest
```

---

## Step 2: Configure in Your IDE

### For VS Code / Cursor

Add to your MCP configuration (usually `mcp_config.json`):

```json
{
  "mcpServers": {
    "testsprite": {
      "command": "npx",
      "args": ["-y", "@testsprite/testsprite-mcp@latest"],
      "env": {
        "TESTSPRITE_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

**Replace `YOUR_API_KEY_HERE` with your actual TestSprite API key.**

---

## Step 3: Restart IDE

After adding the configuration, restart your IDE completely.

---

## Step 4: Verify Connection

Once connected, you can use TestSprite by asking:
> "Help me test this project with TestSprite"

---

## API Key Location

Your TestSprite API key can be found at:
- Login to [TestSprite Dashboard](https://testsprite.com)
- Go to Settings → API Keys
- Copy your key

---

## Your API Key (Partial)
```
sk-user-RilGpvPUVJOk...4zZIwg4M-l3hQwYeS5K4
```
*⚠️ This appears truncated. Please verify the complete key.*
