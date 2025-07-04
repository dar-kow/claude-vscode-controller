# 🚀 Getting Started with Claude VSCode Controller

Welcome to Claude VSCode Controller! This guide will help you get up and running in just a few minutes.

## 📋 Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** installed ([Download here](https://nodejs.org/))
- **VSCode 1.80+** installed ([Download here](https://code.visualstudio.com/))
- **Claude Desktop** installed ([Download here](https://claude.ai/desktop))
- **Git** installed (for development)

## 🎯 Quick Installation

### Option 1: One-Click Installer (Recommended)

**Windows (PowerShell as Administrator):**
```powershell
iwr -useb https://raw.githubusercontent.com/dar-kow/claude-vscode-controller/main/install.ps1 | iex
```

**macOS/Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/dar-kow/claude-vscode-controller/main/install.sh | bash
```

### Option 2: Manual Installation

```bash
# 1. Clone the repository
git clone https://github.com/dar-kow/claude-vscode-controller.git
cd claude-vscode-controller

# 2. Install dependencies
npm install

# 3. Build the extension
npm run build

# 4. Install VSCode extension
npm run install-extension

# 5. Configure Claude Desktop
npm run configure-claude
```

## 🔧 Setup Process

### Step 1: Start VSCode
```bash
code .
```

### Step 2: Activate the Bridge
1. Open Command Palette: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
2. Type: `Start Claude MCP Bridge`
3. Press Enter
4. Look for `🤖 Claude MCP: Online` in the status bar

### Step 3: Start MCP Server
```bash
npm start
```

### Step 4: Test the Connection
```bash
npm run test:bridge
```

If everything works, you should see ✅ for all tests!

## 🧪 First Test

1. **Open Claude Desktop**
2. **Try a simple command:**
   ```
   "Show me the current workspace info"
   ```
3. **You should see VSCode workspace details!**

## 💡 Your First Commands

Here are some commands to get you started:

### File Operations
```
"Create a new file called hello.js with a console.log"
"Open the package.json file"
"Save all open files"
```

### Code Editing
```
"Add a comment at the top of this file"
"Replace 'hello' with 'greetings' in this file"
"Format this document"
```

### Navigation
```
"Go to line 10"
"Show me all open tabs"
"What's the active file?"
```

### Terminal Commands
```
"Open a new terminal"
"Run 'npm --version' in the terminal"
```

## 🎨 Customization

### Change Themes
```
"Change to dark theme"
"Switch to Light+ theme"
"What themes are available?"
```

### Layout Management
```
"Split the editor vertically"
"Close all tabs"
"Show the file explorer"
```

## 🔍 Advanced Usage

### Search Operations
```
"Search for 'TODO' in all files"
"Find all console.log statements"
```

### Code Intelligence
```
"Show me errors in this file"
"Format the current document"
"What diagnostics do we have?"
```

### Extension Management
```
"Install the Prettier extension"
"What extensions are installed?"
```

## 🛠️ Troubleshooting

### Common Issues

**❌ "Bridge not connected"**
- Make sure VSCode is running
- Activate bridge: `Ctrl+Shift+P` → `Start Claude MCP Bridge`
- Check status bar for `🤖 Claude MCP: Online`

**❌ "Command timeout"**
- Restart VSCode Bridge: `Ctrl+Shift+P` → `Stop Claude MCP Bridge` → `Start Claude MCP Bridge`
- Restart MCP Server: `npm start`

**❌ "Extension not found"**
- Reinstall extension: `npm run install-extension`
- Restart VSCode

**❌ "Claude Desktop not responding"**
- Restart Claude Desktop
- Check configuration: `npm run configure-claude`

### Debug Mode

Enable detailed logging:
```bash
npm run debug
```

### Run Diagnostics
```bash
npm run doctor
```

## 📚 Next Steps

1. **Explore the [API Documentation](API.md)** - Learn all 30+ available commands
2. **Check out [Examples](../EXAMPLES.md)** - See real-world usage patterns  
3. **Read [Contributing Guide](../CONTRIBUTING.md)** - Help improve the project
4. **Join the [Discussions](https://github.com/dar-kow/claude-vscode-controller/discussions)** - Ask questions and share tips

## 🎯 Quick Tips

### Be Specific
Instead of: "Edit this file"
Try: "Add error handling to the main function"

### Use Context
Claude remembers what you're working on:
```
"Open utils.js"
"Add a date formatting function"
"Now save the file"
```

### Chain Operations
```
"Create a React component called Button, add TypeScript props, and format the file"
```

### Ask for Help
```
"What can you do with VSCode?"
"Show me the available commands"
```

## 🎉 You're Ready!

You now have a powerful AI assistant integrated directly with VSCode! 

**Try saying:** *"Create a simple Express server with error handling and save it as server.js"*

## 📞 Need Help?

- **📖 Documentation**: Check the [API Reference](API.md)
- **🐛 Bug Reports**: [Create an issue](https://github.com/dar-kow/claude-vscode-controller/issues)
- **💬 Questions**: [Start a discussion](https://github.com/dar-kow/claude-vscode-controller/discussions)
- **📧 Email**: [darek@sdet.pl](mailto:darek@sdet.pl)

---

**Happy coding with Claude! 🚀**