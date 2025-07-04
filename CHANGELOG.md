# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-19

### Added
- 🤖 Complete Claude Desktop integration via Model Context Protocol (MCP)
- 🔌 WebSocket bridge for real-time VSCode communication on port 3333
- 📁 30+ file management commands (create, open, save, close, read)
- ✏️ Advanced text editing capabilities (insert, replace, find & replace)
- 🧭 Navigation tools (goto line, text selection, cursor positioning)
- �� Code intelligence (diagnostics, formatting, search in files)
- 🖥️ Terminal integration (create terminals, send commands)
- 🎨 VSCode customization (themes, extensions, layout management)
- 🛠️ Developer tools (workspace info, open tabs, active editor details)
- 📋 Comprehensive error handling and status reporting
- 🚀 One-click installers for Windows (PowerShell) and Unix/Linux/macOS
- 🩺 Built-in diagnostic tools and health checks
- 📚 Complete documentation and usage examples
- 🧪 Integration testing and bridge connection tests

### Features
- **File Operations**: Create, open, save, close, and read files with full path support
- **Text Editing**: Insert text at specific positions, replace content, find and replace with regex
- **Code Navigation**: Jump to lines, select text regions, get current selection
- **Code Intelligence**: Format documents, view diagnostics (errors/warnings)
- **Search**: Search across files in workspace with VSCode integration
- **Terminal Control**: Open multiple terminals, send commands, manage sessions
- **Extension Management**: List, install VSCode extensions programmatically
- **Theme & UI**: Change color themes, split editor layouts, manage tabs
- **Workspace Management**: Get project info, list open files, monitor active editor
- **Bridge Status**: Real-time connection monitoring with status bar indicator

### Technical
- Built with TypeScript and Node.js 18+
- Uses Model Context Protocol (MCP) SDK v0.5.0
- WebSocket communication for low-latency commands
- VSCode Extension API integration
- Cross-platform support (Windows, macOS, Linux)
- Comprehensive error handling and logging
- Automatic reconnection and retry logic

### Documentation
- Complete setup and installation guide
- 30+ usage examples for different workflows
- API reference for all available commands
- Troubleshooting guide for common issues
- Architecture documentation
- Contributing guidelines for developers

[1.0.0]: https://github.com/dar-kow/claude-vscode-controller/releases/tag/v1.0.0
