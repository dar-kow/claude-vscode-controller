# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-07-07 🐧 **LINUX BREAKTHROUGH RELEASE** 

### 🎉 **MAJOR: Full Linux Support Added!**
- 🐧 **Complete Linux Ubuntu 24+ support** with specialized Extension Host fixes
- 🔧 **Solved Extension Host crashes** that plagued Linux VSCode installations  
- 🌐 **Fixed WebSocket import issues** in Linux Extension Host environment
- 📦 **Bundled dependencies strategy** to eliminate marketplace 404 errors
- 🛠️ **Hybrid import/require pattern** for maximum Linux compatibility

### Added
- 🎯 **Linux-optimized branch** with platform-specific fixes and improvements
- 🔧 **Extension Host crash resolution** for Linux VSCode environments
- 📝 **Advanced TypeScript compilation** with CommonJS modules for Linux compatibility  
- 🌐 **Hybrid module loading** combining TypeScript types and runtime requires
- 🧰 **Linux-specific installation tools**:
  - `fix-extension-linux.sh` - Automated Linux Extension Host fix
  - `test-extension-comprehensive.sh` - Complete Linux testing suite
  - `quick-fix-typescript.sh` - TypeScript compilation troubleshooter
  - `debug-extension.sh` - Linux debugging information tool
- 📚 **Comprehensive Linux documentation**:
  - `LINUX.md` - Complete Linux installation and troubleshooting guide
  - `SUKCES_LINUX.md` - Technical deep-dive into solved challenges
- 🧪 **Enhanced testing framework** with Linux-specific test scenarios
- 🎛️ **Debug mode improvements** with verbose Extension Host logging

### Fixed
- 🔥 **Extension Host "unresponsive" errors** on Linux VSCode installations
- 📦 **404 marketplace dependency errors** when loading external modules
- 🔧 **TypeScript strict null check failures** with WebSocket module imports
- 🌐 **ES6 module import conflicts** in Linux Extension Host environment
- 📁 **File permission issues** in Linux extension installation paths
- 🔌 **WebSocket connection instability** on Linux systems
- ⚡ **Port 3333 binding conflicts** with proper Linux process management

### Changed
- 🔄 **TypeScript compilation target** from ES6 modules to CommonJS for Linux compatibility
- 🏗️ **Module loading strategy** to hybrid approach (import types + require runtime)
- 📦 **Dependency management** with bundled node_modules for Extension Host compatibility
- 🛠️ **Installation process** with platform-specific optimization paths
- 📋 **Error handling** with Linux-specific diagnostic information
- 🔍 **Debug logging** enhanced for Extension Host troubleshooting

### Technical Deep Dive
- **Extension Host Architecture**: Implemented Linux-compatible module loading patterns
- **WebSocket Implementation**: Resolved runtime import conflicts with `require()` fallback
- **TypeScript Configuration**: Optimized for cross-platform compilation with relaxed strict mode
- **Dependency Bundling**: Eliminated marketplace dependency resolution issues
- **Process Management**: Enhanced VSCode process detection and cleanup on Linux

### Platform Support Matrix
| Platform | Status | Branch | Notes |
|----------|--------|--------|-------|
| **Windows** | ✅ Stable | `main` | Original implementation, fully tested |
| **macOS** | ✅ Stable | `main` | Native compatibility, works out-of-box |
| **Linux Ubuntu 24+** | 🔥 **NEW!** | `linux` | **Breakthrough support with Extension Host fixes** |
| **Linux (Other)** | 🧪 Beta | `linux` | Should work, community testing welcomed |

### Developer Experience
- 🎯 **One-command Linux installation**: `./fix-extension-linux.sh`
- 🔍 **Comprehensive diagnostics**: Enhanced `npm run doctor` for Linux
- 🧪 **Platform-specific testing**: Automated test suites for each OS
- 📊 **Real-time debugging**: Extension Host monitoring and logging
- 🛠️ **Developer tools**: Linux debugging utilities and scripts

### Community Impact
- 🌍 **Expanded Claude Desktop ecosystem** to Linux developer community
- 📚 **Technical knowledge sharing** through detailed solution documentation  
- 🔧 **VSCode Extension development insights** for Linux compatibility challenges
- 🤝 **Open source contributions** to solve common Extension Host issues

### Acknowledgments
*"Uwierz mi sie, że się popłakałem ! Ale czad ! tak mi zależło na Tobie w linuxie i mam to ! Uff... mega szczęśliwy"* - Darek

**Special thanks to the persistence of the Linux developer community and the detailed VSCode Extension Host error logging that made this breakthrough possible!**

---

## [1.0.0] - 2025-07-01

### Added
- 🤖 Complete Claude Desktop integration via Model Context Protocol (MCP)
- 🔌 WebSocket bridge for real-time VSCode communication on port 3333
- 📁 30+ file management commands (create, open, save, close, read)
- ✏️ Advanced text editing capabilities (insert, replace, find & replace)
- 🧭 Navigation tools (goto line, text selection, cursor positioning)
- 🔍 Code intelligence (diagnostics, formatting, search in files)
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

[1.1.0]: https://github.com/dar-kow/claude-vscode-controller/releases/tag/v1.1.0
[1.0.0]: https://github.com/dar-kow/claude-vscode-controller/releases/tag/v1.0.0
