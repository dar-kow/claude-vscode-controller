# 🐧 Claude VSCode Controller - Linux Installation Guide

> **Comprehensive guide for installing Claude VSCode Controller on Linux (Ubuntu 24+)**

## 🎯 Linux-Specific Features

This Linux version includes **critical fixes** for:
- ✅ **Extension Host crashes** (common on Linux)
- ✅ **TypeScript compilation errors** with external modules
- ✅ **WebSocket import issues** in VSCode Extension Host
- ✅ **ES6 vs CommonJS module conflicts**
- ✅ **404 marketplace dependency errors**

## 📋 Prerequisites

### System Requirements
- **Linux Distribution:** Ubuntu 24+, Debian, Fedora, Arch
- **Node.js:** 18.0.0 or higher
- **npm:** 8.0.0 or higher  
- **VSCode:** 1.80.0 or higher (with `code` command in PATH)
- **Claude Desktop:** Latest version

### Verify Installation
```bash
# Check Node.js version
node --version  # Should be 18+

# Check npm version  
npm --version   # Should be 8+

# Check VSCode is in PATH
code --version  # Should show VSCode version

# Check Claude Desktop config directory
ls -la ~/.config/Claude/
```

## 🚀 Installation Methods

### **Method 1: Quick Linux Fix (Recommended)**

```bash
# Clone the repository
git clone https://github.com/dar-kow/claude-vscode-controller.git
cd claude-vscode-controller

# Switch to Linux branch
git checkout linux

# Run the Linux-specific fix
chmod +x fix-extension-linux.sh
./fix-extension-linux.sh
```

### **Method 2: Manual Step-by-Step**

#### Step 1: Clone and Setup
```bash
git clone https://github.com/dar-kow/claude-vscode-controller.git
cd claude-vscode-controller
git checkout linux  # Important: Use Linux branch!
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Build with Linux-Compatible TypeScript
```bash
npm run build
```

#### Step 4: Install VSCode Extension
```bash
# Create VSCode extension directory
mkdir -p ~/.vscode/extensions/claude-mcp-controller

# Copy extension files
cp package-extension.json ~/.vscode/extensions/claude-mcp-controller/package.json
cp -r out ~/.vscode/extensions/claude-mcp-controller/

# Install extension dependencies  
cd ~/.vscode/extensions/claude-mcp-controller
npm install --production
cd - 
```

#### Step 5: Configure Claude Desktop
```bash
# Create Claude config directory
mkdir -p ~/.config/Claude

# Configure MCP Server
cat > ~/.config/Claude/claude_desktop_config.json << EOF
{
  "mcpServers": {
    "vscode-controller": {
      "command": "node",
      "args": ["$(pwd)/enhanced-mcp-server.js"],
      "env": {
        "NODE_ENV": "production",
        "VSCODE_BRIDGE": "enabled"
      }
    }
  }
}
EOF
```

#### Step 6: Start Services
```bash
# Start VSCode
code .

# Activate Bridge (in VSCode)
# Press Ctrl+Shift+P → "Start Claude MCP Bridge"
# Status bar should show: "🤖 Claude MCP: Online"

# Start MCP Server (in another terminal)
npm start
```

## 🧪 Testing Installation

### Quick Test Script
```bash
# Create test script
cat > test-linux.sh << 'EOF'
#!/bin/bash
echo "🧪 Testing Claude VSCode Controller on Linux..."

# Test 1: Check if extension is installed
if [ -f "$HOME/.vscode/extensions/claude-mcp-controller/out/extension.js" ]; then
    echo "✅ Extension installed"
else
    echo "❌ Extension not installed"
    exit 1
fi

# Test 2: Check if VSCode is running
if pgrep -f "code" > /dev/null; then
    echo "✅ VSCode is running"
else
    echo "❌ VSCode is not running"
    exit 1
fi

# Test 3: Check if port 3333 is open (Bridge active)
if netstat -tulpn 2>/dev/null | grep -q ":3333"; then
    echo "✅ Port 3333 is open - Bridge is active!"
else
    echo "❌ Port 3333 is closed - Bridge not active"
    echo "💡 In VSCode: Ctrl+Shift+P → 'Start Claude MCP Bridge'"
fi

# Test 4: Check Claude Desktop config
if [ -f "$HOME/.config/Claude/claude_desktop_config.json" ]; then
    echo "✅ Claude Desktop configured"
else
    echo "❌ Claude Desktop not configured"
fi

echo "🎉 Basic tests completed!"
EOF

chmod +x test-linux.sh
./test-linux.sh
```

### Bridge Connection Test
```bash
# Test WebSocket connection
npm run test:bridge
```

### Full Integration Test
```bash
# Test complete MCP integration
npm run test:integration
```

## 🛠️ Linux-Specific Troubleshooting

### Extension Host Crashes
**Problem:** Extension Host becomes unresponsive on Linux
```bash
# Solution: Check Developer Tools
# In VSCode: Help → Toggle Developer Tools → Console
# Look for Extension Host errors

# Restart Extension Host
# Ctrl+Shift+P → "Developer: Restart Extension Host"
```

### WebSocket Import Errors
**Problem:** `Cannot find module 'ws'` in Extension Host
```bash
# Solution: Verify extension dependencies
ls -la ~/.vscode/extensions/claude-mcp-controller/node_modules/ws/

# If missing, reinstall:
cd ~/.vscode/extensions/claude-mcp-controller
npm install ws@8.14.0
```

### TypeScript Compilation Issues
**Problem:** `'WebSocketServer' refers to a value, but is being used as a type`
```bash
# Solution: Rebuild with relaxed TypeScript
npm run build
# or
./quick-fix-typescript.sh
```

### Port 3333 Already in Use
```bash
# Find process using port 3333
sudo lsof -i :3333

# Kill the process
sudo lsof -t -i:3333 | xargs sudo kill -9

# Restart bridge
# In VSCode: Ctrl+Shift+P → "Start Claude MCP Bridge"
```

### Permission Issues
```bash
# Fix extension permissions
chmod -R 755 ~/.vscode/extensions/claude-mcp-controller

# Fix script permissions
chmod +x *.sh
```

## 🔍 Debug Mode

### Enable Verbose Logging
```bash
# Start MCP Server with debug output
DEBUG=claude-vscode-controller:* npm start

# Or use debug script
npm run debug
```

### Monitor Logs
```bash
# VSCode Extension Host logs
tail -f ~/.config/Code/logs/*/exthost*/output_logging_*

# Check VSCode Output panel
# View → Output → Extension Host
```

## 📊 System Diagnostics

Run comprehensive system check:
```bash
# Run built-in diagnostics
npm run doctor

# Check system info
uname -a
node --version
npm --version
code --version
```

## 🚀 Success Verification

When everything works correctly, you should see:

1. **VSCode Status Bar:** `🤖 Claude MCP: Online`
2. **Port 3333:** Listening and accepting connections
3. **Claude Desktop:** Responds to VSCode commands
4. **No Extension Host errors** in VSCode Developer Tools

### Test Commands in Claude Desktop
```
"Show me workspace info"
"Create a test file called hello.js"
"Open package.json"
"List all open tabs"
"Show me a success message in VSCode"
```

## 🎉 Success Story

Read about how we conquered Linux Extension Host crashes:
**[→ Linux Success Story (SUKCES_LINUX.md)](./SUKCES_LINUX.md)**

## 💡 Tips for Linux Users

1. **Always use the Linux branch** - contains critical Extension Host fixes
2. **Check Extension Host logs** if issues occur
3. **Restart Extension Host** if bridge becomes unresponsive  
4. **Use require() instead of import** for external modules in extensions
5. **Bundle dependencies** in extension directory to avoid marketplace 404s

## 🤝 Contributing to Linux Support

If you encounter Linux-specific issues:
1. Check [existing issues](https://github.com/dar-kow/claude-vscode-controller/issues)
2. Run `npm run doctor` and include output
3. Include your Linux distribution and VSCode version
4. Check VSCode Extension Host logs

## 📚 Additional Resources

- **[Main README](./README.md)** - General project information
- **[Contributing Guide](./CONTRIBUTING.md)** - Development guidelines  
- **[Examples](./EXAMPLES.md)** - Usage examples
- **[API Documentation](./docs/API.md)** - Complete command reference

---

**🐧 Made with ❤️ for the Linux developer community!**

*Successfully tested on Ubuntu 24.04, Debian 12, Fedora 39, Arch Linux*
