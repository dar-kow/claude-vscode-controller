# 🤖 Claude VSCode Controller

> **Control VSCode directly from Claude Desktop with 30+ powerful commands!**

## 🐧 **Linux Users - Special Branch Available!**

**✨ NEW: Full Linux Ubuntu 24+ support!** 🎉

🔗 **[→ Linux Branch (Ubuntu 24+)](https://github.com/dar-kow/claude-vscode-controller/tree/linux)** - Optimized for Linux with Extension Host fixes  
📖 **[→ Linux Success Story](./SUKCES_LINUX.md)** - See how we conquered Linux Extension Host crashes!  
🛠️ **[→ Linux Installation Guide](./LINUX.md)** - Step-by-step Linux setup instructions

Transform your coding workflow by giving Claude Desktop full control over your VSCode editor. Create files, edit code, manage extensions, run terminals, and more - all through natural language commands.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![VSCode](https://img.shields.io/badge/VSCode-1.80%2B-blue.svg)](https://code.visualstudio.com/)
[![Claude Desktop](https://img.shields.io/badge/Claude-Desktop-orange.svg)](https://claude.ai/desktop)

## ✨ Features

### 🎯 **File Management**
- Create, open, save, and close files
- Read file contents through Claude
- List directory structures
- Manage file permissions

### ✏️ **Code Editing**  
- Insert text at specific positions
- Find and replace with regex support
- Format documents automatically
- Navigate to specific lines
- Select text programmatically

### 🔍 **Code Intelligence**
- View diagnostics (errors/warnings)
- Get active editor information
- Monitor open tabs
- Workspace information

### 🖥️ **Terminal Control**
- Open multiple terminals
- Send commands to terminals
- Manage terminal sessions
- Execute VSCode tasks

### 🎨 **Customization**
- Change themes instantly
- Install/manage extensions
- Split editor layouts
- Configure settings

## 🚀 Quick Start

### **Option 1: Automated Installation (Recommended)**

```bash
# Windows (PowerShell as Administrator)
curl -fsSL https://raw.githubusercontent.com/dar-kow/claude-vscode-controller/main/install.ps1 | powershell -

# macOS/Linux
curl -fsSL https://raw.githubusercontent.com/dar-kow/claude-vscode-controller/main/install.sh | bash
```

### **Option 2: Manual Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/dar-kow/claude-vscode-controller.git
   cd claude-vscode-controller
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Install VSCode extension**
   ```bash
   npm run install-extension
   ```

5. **Configure Claude Desktop**
   ```bash
   npm run configure-claude
   ```

6. **Start the services**
   ```bash
   npm start
   ```

## 📋 Usage Examples

Once installed, you can control VSCode from Claude Desktop using natural language:

### File Operations
```
"Create a new file called hello.js with a console.log"
"Open the package.json file"
"Save all open files"
"Show me the contents of README.md"
```

### Code Editing
```
"Add a comment at the top of the current file"
"Replace all 'var' with 'const' in this file"
"Format the current document"
"Go to line 50"
```

### Project Management
```
"Show me all open tabs"
"What's the current workspace structure?"
"Install the Prettier extension"
"Change theme to Dark+"
```

### Terminal Commands
```
"Open a new terminal"
"Run 'npm test' in the terminal"
"Create a terminal in the src folder"
```

## 🛠️ Architecture

```
┌─────────────────┐    WebSocket     ┌──────────────────┐
│   Claude        │◄────────────────►│   VSCode         │
│   Desktop       │    Port 3333     │   Extension      │
│                 │                  │   (Bridge)       │
└─────────────────┘                  └──────────────────┘
         ▲                                     ▲
         │                                     │
         │ MCP Protocol                        │ VSCode API
         │                                     │
         ▼                                     ▼
┌─────────────────┐                  ┌──────────────────┐
│   Enhanced      │                  │   VSCode         │
│   MCP Server    │                  │   Editor         │
└─────────────────┘                  └──────────────────┘
```

## 🧪 Testing

```bash
# Test VSCode Bridge connection
npm run test:bridge

# Test MCP Server
npm run test:mcp

# Run full integration test
npm test

# Debug mode
npm run debug
```

## 🛟 Troubleshooting

### Common Issues

**❌ "Port 3333 is closed"**
- In VSCode: `Ctrl+Shift+P` → "Start Claude MCP Bridge"

**❌ "VSCode extension not found"**
- Run: `npm run install-extension`

**❌ "Claude Desktop not responding"**
- Restart Claude Desktop and check config: `npm run configure-claude`

**❌ "WebSocket connection failed"**
- Check if VSCode is running and restart MCP Server

### Debug Mode

```bash
# Enable debug logging
npm run debug

# Run diagnostics
npm run doctor
```

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Claude Desktop](https://claude.ai/desktop) for the amazing AI assistant
- [VSCode](https://code.visualstudio.com/) for the extensible editor
- [Model Context Protocol](https://modelcontextprotocol.io/) for the communication standard

---

**⭐ If this project helps you, please give it a star on GitHub!**

Made with ❤️ for the developer community
