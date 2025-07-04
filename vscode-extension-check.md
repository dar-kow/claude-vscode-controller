# 🔧 Claude VSCode Controller - Extension Verification

## 1. Check if extension is installed:
- Open VSCode
- Press `Ctrl + Shift + X` (Extensions)
- Search for "Claude MCP Controller"
- Check if it appears in installed extensions

## 2. If extension DOES NOT EXIST:
Install it manually:

### A. From VSIX file:
```bash
# In VSCode terminal or external terminal
code --install-extension claude-mcp-controller.vsix
```

### B. Manual installation:
1. Copy extension folder to:
   ```
   Windows: %USERPROFILE%\.vscode\extensions\claude-mcp-controller
   macOS: ~/.vscode/extensions/claude-mcp-controller
   Linux: ~/.vscode/extensions/claude-mcp-controller
   ```

2. Restart VSCode

## 3. Check if extension loaded properly:
1. Press `Ctrl + Shift + P`
2. Type "Claude MCP"
3. These commands should appear:
   - ✅ Start Claude MCP Bridge
   - ✅ Stop Claude MCP Bridge  
   - ✅ Claude MCP Status

## 4. Start the Bridge:
1. `Ctrl + Shift + P`
2. "Start Claude MCP Bridge"
3. Status bar should show: "🤖 Claude MCP: Online"

## 5. Test connection:
```bash
npm run test:bridge
# or
node test-connection.js
```

## 🚨 IMPORTANT:
- Bridge must be started BEFORE launching MCP Server
- Port 3333 must be available
- VSCode must have an active workspace

## 🛠️ Troubleshooting:
- If commands don't appear: restart VSCode and try again
- If bridge won't start: check if port 3333 is free
- If connection fails: ensure VSCode workspace is open
