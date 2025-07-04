# 🤝 Contributing to Claude VSCode Controller

Thank you for your interest in contributing! This project aims to revolutionize how developers interact with VSCode through Claude Desktop.

## 🎯 Project Vision

**Goal**: Seamless integration between Claude Desktop and VSCode, enabling natural language control of the editor with 30+ powerful commands.

**Architecture**: VSCode Extension ↔ WebSocket Bridge ↔ MCP Server ↔ Claude Desktop

## 🚀 Quick Start for Contributors

### Prerequisites

- **Node.js 18+** with npm
- **VSCode 1.80+** with `code` command in PATH
- **Git** for version control
- **TypeScript** knowledge (extension is written in TS)
- **WebSocket** understanding (for bridge communication)

### Development Setup

1. **Fork & Clone**
   ```bash
   git clone https://github.com/YOUR-USERNAME/claude-vscode-controller.git
   cd claude-vscode-controller
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build Extension**
   ```bash
   npm run build
   ```

4. **Install Development Extension**
   ```bash
   npm run setup:dev
   ```

5. **Start Development**
   ```bash
   # Terminal 1: Watch TypeScript compilation
   npm run build:watch
   
   # Terminal 2: Start MCP Server in debug mode
   npm run debug
   
   # Terminal 3: Test bridge connection
   npm run test:bridge
   ```

## 🏗️ Architecture Deep Dive

### Component Overview

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

### 1. **VSCode Extension** (`src/extension.ts`)
- **Purpose**: WebSocket server providing bridge between Claude and VSCode
- **Technology**: TypeScript, VSCode Extension API, WebSocket
- **Key Functions**:
  - Start/stop WebSocket server on port 3333
  - Handle VSCode API calls (file operations, editor control, etc.)
  - Provide status monitoring and error handling

### 2. **Enhanced MCP Server** (`enhanced-mcp-server.js`)
- **Purpose**: Translate Claude commands to VSCode bridge calls
- **Technology**: Node.js, MCP SDK, WebSocket client
- **Key Functions**:
  - Parse MCP requests from Claude Desktop
  - Send WebSocket commands to VSCode bridge
  - Format responses back to Claude Desktop

### 3. **WebSocket Bridge Protocol**
- **Port**: 3333 (configurable)
- **Format**: JSON messages with `id`, `method`, `params`
- **Example**:
  ```json
  {
    "id": "1234567890",
    "method": "getWorkspaceInfo",
    "params": {}
  }
  ```

## 📁 Project Structure

```
claude-vscode-controller/
├── src/
│   ├── extension.ts          # VSCode extension entry point
│   └── bridge/              # WebSocket bridge implementation
├── scripts/
│   ├── install-extension.js  # Extension installer
│   ├── configure-claude.js   # Claude config helper
│   └── doctor.js            # Diagnostic tool
├── tests/
│   ├── unit/                # Unit tests
│   └── integration/         # Integration tests
├── enhanced-mcp-server.js   # Main MCP server (compiled)
├── package.json             # Project configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project overview
```

## 🛠️ Development Workflow

### Adding New Commands

1. **Define MCP Tool** (in `enhanced-mcp-server.js`)
   ```javascript
   {
     name: "vscode_new_command",
     description: "Description of what it does",
     inputSchema: {
       type: "object",
       properties: {
         parameter: {
           type: "string",
           description: "Parameter description"
         }
       },
       required: ["parameter"]
     }
   }
   ```

2. **Add Command Handler**
   ```javascript
   case "vscode_new_command":
     return await this.vscodeNewCommand(args.parameter);
   ```

3. **Implement Method**
   ```javascript
   async vscodeNewCommand(parameter) {
     try {
       const result = await this.sendVSCodeCommand('newCommand', { parameter });
       return {
         content: [{
           type: "text",
           text: result.success 
             ? `✅ Command executed successfully`
             : `❌ Error: ${result.error}`
         }]
       };
     } catch (error) {
       return {
         content: [{
           type: "text",
           text: `❌ Error: ${error.message}`
         }]
       };
     }
   }
   ```

4. **Add Bridge Handler** (in `src/extension.ts`)
   ```typescript
   case 'newCommand':
     return await this.handleNewCommand(params);
   ```

5. **Test Implementation**
   ```bash
   npm run build
   npm run test:bridge
   ```

### Code Style Guidelines

- **TypeScript**: Strict mode enabled, no `any` types
- **Formatting**: Prettier with 2-space indentation
- **Linting**: ESLint with TypeScript rules
- **Naming**: camelCase for variables, PascalCase for classes
- **Comments**: JSDoc for public methods

### Testing Strategy

1. **Unit Tests**: Test individual functions/methods
2. **Integration Tests**: Test component interactions  
3. **E2E Tests**: Full Claude → VSCode workflow
4. **Manual Tests**: Real-world usage scenarios

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:bridge
npm run test:mcp

# Run with coverage
npm run test -- --coverage
```

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start with auto-reload
npm run debug           # Start with debug logging
npm run build:watch     # Watch TypeScript compilation

# Testing
npm run test            # Run all tests
npm run test:bridge     # Test WebSocket bridge
npm run test:mcp        # Test MCP server
npm run doctor          # Run diagnostics

# Code Quality
npm run lint            # Check code style
npm run format          # Format code

# Installation
npm run setup           # Full setup (prod)
npm run setup:dev       # Development setup
npm run install-extension # Install VSCode extension
npm run configure-claude   # Configure Claude Desktop

# Maintenance
npm run clean           # Clean build artifacts
npm run reset           # Complete reset
npm run uninstall       # Remove installation
```

## 🧪 Testing Your Changes

### Manual Testing Checklist

1. **Install Development Version**
   ```bash
   npm run setup:dev
   ```

2. **Start VSCode & Activate Bridge**
   - Open VSCode: `code .`
   - Press `Ctrl+Shift+P`
   - Run: `Start Claude MCP Bridge`
   - Verify status bar shows: `🤖 Claude MCP: Online`

3. **Start MCP Server**
   ```bash
   npm run debug
   ```

4. **Test Basic Commands**
   ```bash
   npm run test:bridge
   ```

5. **Test in Claude Desktop**
   - Restart Claude Desktop
   - Try: "Show me workspace info"
   - Try: "Create a test file"
   - Try: "Open package.json"

### Automated Testing

```bash
# Quick smoke test
npm run test:bridge

# Full test suite
npm test

# Integration tests
npm run test:integration
```

## 🐛 Debugging

### Enable Debug Logging

```bash
# Environment variable
export DEBUG=claude-vscode-controller:*

# Or use npm script
npm run debug
```

### Common Debug Points

1. **WebSocket Connection**: Check port 3333 availability
2. **VSCode Extension**: Check extension is loaded and active
3. **MCP Server**: Verify Claude Desktop config is correct
4. **Command Flow**: Trace command from Claude → MCP → Bridge → VSCode

### Debug Tools

```bash
# System diagnostics
npm run doctor

# Check installation
npm run test:bridge

# Verbose MCP server
npm run debug
```

## 📝 Submitting Changes

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes & Test**
   ```bash
   npm run build
   npm test
   npm run lint
   ```

3. **Commit with Conventional Commits**
   ```bash
   git commit -m "feat: add new VSCode command for X"
   git commit -m "fix: resolve WebSocket connection issue"
   git commit -m "docs: update API documentation"
   ```

4. **Push & Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### PR Requirements

- ✅ All tests pass (`npm test`)
- ✅ Code follows style guide (`npm run lint`)
- ✅ TypeScript compiles without errors
- ✅ Changes are documented
- ✅ Breaking changes noted in description

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples**:
- `feat(bridge): add file watching capability`
- `fix(mcp): resolve timeout handling`
- `docs(api): add examples for new commands`

## 📋 Roadmap

### Current Priorities

1. **Stability**: Improve error handling & recovery
2. **Performance**: Optimize WebSocket communication
3. **Features**: Add more VSCode commands
4. **Testing**: Increase test coverage to 90%+
5. **Documentation**: Complete API reference

### Future Ideas

- **Multi-workspace Support**: Handle multiple VSCode instances
- **Plugin System**: Allow custom command extensions
- **Claude Plugins**: Direct integration with Claude plugins
- **Remote Development**: Support for remote VSCode instances
- **GUI Configuration**: Settings panel in VSCode

## 🙏 Recognition

Contributors will be:
- Listed in README.md
- Credited in release notes
- Invited to maintainer team (for significant contributions)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Happy coding! 🚀**

*This project thrives on community contributions. Whether you're fixing bugs, adding features, or improving documentation, every contribution makes Claude VSCode Controller better for everyone.*
