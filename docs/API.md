# 📋 Claude VSCode Controller - API Reference

Complete documentation of all available commands for controlling VSCode from Claude Desktop.

## 🏗️ Architecture Overview

```
Claude Desktop → MCP Server → WebSocket Bridge → VSCode Extension → VSCode API
```

## 📁 Workspace Management

### `vscode_get_workspace_info`
Get current VSCode workspace information including project details and configuration.

**Parameters:** None

**Returns:**
```json
{
  "hasWorkspace": true,
  "folders": [
    {
      "name": "project-name",
      "path": "/path/to/project"
    }
  ],
  "activeEditor": {
    "fileName": "/path/to/file.js",
    "language": "javascript",
    "lineCount": 150,
    "cursorPosition": { "line": 25, "character": 10 }
  }
}
```

**Example Usage:**
```
"What's the current workspace info?"
"Show me project details"
```

### `vscode_get_open_tabs`
List all currently open tabs/files in VSCode editor.

**Parameters:** None

**Returns:**
```json
[
  {
    "fileName": "/path/to/file.js",
    "isActive": true,
    "isDirty": false
  }
]
```

**Example Usage:**
```
"What files are currently open?"
"Show me all open tabs"
```

### `vscode_get_active_editor`
Get information about the currently active editor and file.

**Parameters:** None

**Returns:**
```json
{
  "fileName": "/path/to/active/file.js",
  "language": "javascript",
  "lineCount": 100,
  "cursorPosition": { "line": 15, "character": 5 }
}
```

**Example Usage:**
```
"What file is currently active?"
"Show me the current editor info"
```

## 📄 File Operations

### `vscode_open_file`
Open a specific file in VSCode editor.

**Parameters:**
- `filePath` (string): Path to the file to open

**Example Usage:**
```
"Open the package.json file"
"Open src/components/Button.tsx"
```

### `vscode_create_file`
Create a new file with content in VSCode.

**Parameters:**
- `filePath` (string): Path for the new file
- `content` (string, optional): Content for the new file

**Example Usage:**
```
"Create a new file called utils.js with helper functions"
"Create README.md with project description"
```

### `vscode_get_file_content`
Read and return the content of a file.

**Parameters:**
- `filePath` (string): Path to the file to read

**Returns:**
```json
{
  "success": true,
  "filePath": "/path/to/file.js",
  "content": "file content here...",
  "lineCount": 50,
  "language": "javascript"
}
```

**Example Usage:**
```
"Show me the contents of package.json"
"Read the main.js file"
```

### `vscode_save_file`
Save the currently active file in VSCode.

**Parameters:** None

**Example Usage:**
```
"Save this file"
"Save the current document"
```

### `vscode_close_file`
Close a file or the currently active file in VSCode.

**Parameters:**
- `filePath` (string, optional): Path to the file to close

**Example Usage:**
```
"Close this file"
"Close package.json"
```

## ✏️ Text Editing

### `vscode_insert_text`
Insert text at current cursor position or specified line/character.

**Parameters:**
- `text` (string): Text to insert
- `line` (number, optional): Line number
- `character` (number, optional): Character position

**Example Usage:**
```
"Insert a TODO comment at the top"
"Add console.log at line 25"
```

### `vscode_replace_text`
Replace text in the currently active file.

**Parameters:**
- `oldText` (string): Text to replace
- `newText` (string): Replacement text
- `replaceAll` (boolean, optional): Replace all occurrences (default: true)

**Example Usage:**
```
"Replace all 'var' with 'const'"
"Change 'oldFunctionName' to 'newFunctionName'"
```

### `vscode_find_and_replace`
Find and replace text with advanced options.

**Parameters:**
- `searchText` (string): Text to search for
- `replaceText` (string): Replacement text
- `replaceAll` (boolean, optional): Replace all occurrences (default: true)

**Example Usage:**
```
"Find and replace 'oldAPI' with 'newAPI'"
"Replace all instances of 'debug' with 'console.log'"
```

## 🧭 Navigation

### `vscode_goto_line`
Navigate to a specific line in the active editor.

**Parameters:**
- `lineNumber` (number): Line number to navigate to (starting from 1)
- `column` (number, optional): Column number (default: 1)

**Example Usage:**
```
"Go to line 50"
"Navigate to line 100, column 20"
```

### `vscode_select_text`
Select text in the active editor.

**Parameters:**
- `startLine` (number): Start line number
- `startColumn` (number): Start column number
- `endLine` (number): End line number
- `endColumn` (number): End column number

**Example Usage:**
```
"Select lines 10 to 15"
"Select the function from line 20 to 35"
```

### `vscode_get_selection`
Get the currently selected text from the active editor.

**Parameters:** None

**Returns:**
```json
{
  "success": true,
  "text": "selected text content",
  "start": { "line": 10, "character": 5 },
  "end": { "line": 12, "character": 20 },
  "isEmpty": false
}
```

**Example Usage:**
```
"What text is currently selected?"
"Show me the current selection"
```

## 🔧 Code Operations

### `vscode_format_document`
Format the currently active document using VSCode's formatting.

**Parameters:** None

**Example Usage:**
```
"Format this document"
"Fix the indentation in this file"
```

### `vscode_get_diagnostics`
Get errors, warnings, and other diagnostics for the active file.

**Parameters:** None

**Returns:**
```json
{
  "success": true,
  "diagnostics": [
    {
      "message": "Unused variable 'x'",
      "severity": "Warning",
      "range": {
        "start": { "line": 10, "character": 5 },
        "end": { "line": 10, "character": 6 }
      },
      "source": "typescript"
    }
  ],
  "count": 1
}
```

**Example Usage:**
```
"Show me errors in this file"
"Are there any warnings?"
```

## 🔍 Search Operations

### `vscode_search_in_files`
Search for text across files in the workspace.

**Parameters:**
- `searchTerm` (string): Text to search for

**Example Usage:**
```
"Search for 'TODO' in all files"
"Find all occurrences of 'apiKey'"
```

## ⚙️ VSCode Commands

### `vscode_execute_command`
Execute a VSCode command.

**Parameters:**
- `command` (string): VSCode command to execute
- `args` (array, optional): Command arguments

**Example Usage:**
```
"Execute workbench.action.toggleSidebarVisibility"
"Run the reload window command"
```

## 💬 UI Operations

### `vscode_show_message`
Show a message in VSCode.

**Parameters:**
- `message` (string): Message to display
- `type` (string, optional): Message type ("info", "warning", "error")

**Example Usage:**
```
"Show a success message"
"Display a warning about the API change"
```

## 🖥️ Terminal Operations

### `vscode_open_terminal`
Open a new terminal in VSCode.

**Parameters:**
- `name` (string, optional): Terminal name
- `cwd` (string, optional): Working directory

**Example Usage:**
```
"Open a new terminal"
"Create a terminal in the src directory"
```

### `vscode_send_terminal_command`
Send a command to the VSCode terminal.

**Parameters:**
- `command` (string): Command to execute
- `terminalName` (string, optional): Terminal name

**Example Usage:**
```
"Run 'npm install' in the terminal"
"Execute 'git status'"
```

## 🔌 Extension Management

### `vscode_get_extensions`
Get list of installed VSCode extensions.

**Parameters:** None

**Returns:**
```json
{
  "success": true,
  "extensions": [
    {
      "id": "ms-python.python",
      "displayName": "Python",
      "version": "2023.20.0",
      "isActive": true,
      "description": "Python language support"
    }
  ],
  "count": 1
}
```

**Example Usage:**
```
"What extensions are installed?"
"Show me all VSCode extensions"
```

## 🎨 Theme and UI

### `vscode_get_themes`
Get list of available VSCode themes.

**Parameters:** None

**Returns:**
```json
{
  "success": true,
  "themes": ["Dark+", "Light+", "Monokai", "Solarized Dark"],
  "current": "Dark+"
}
```

**Example Usage:**
```
"What themes are available?"
"Show me color theme options"
```

### `vscode_change_theme`
Change VSCode color theme.

**Parameters:**
- `themeName` (string): Theme name to apply

**Example Usage:**
```
"Change theme to Dark+"
"Switch to Monokai theme"
```

## 📐 Layout Management

### `vscode_split_editor`
Split the VSCode editor.

**Parameters:**
- `direction` (string, optional): Split direction ("horizontal" or "vertical", default: "vertical")

**Example Usage:**
```
"Split the editor vertically"
"Split editor horizontally"
```

### `vscode_close_all_tabs`
Close all open tabs in VSCode.

**Parameters:**
- `saveAll` (boolean, optional): Save all files before closing (default: true)

**Example Usage:**
```
"Close all tabs"
"Close all files without saving"
```

## 🚨 Error Handling

All commands return a consistent response format:

**Success Response:**
```json
{
  "success": true,
  "data": "result data here",
  "message": "Operation completed"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error description",
  "details": "Additional error information"
}
```

## 💡 Usage Tips

### Natural Language Examples

1. **File Management:**
   - "Create a React component called Button"
   - "Open the package.json and show me dependencies"
   - "Save all open files"

2. **Code Editing:**
   - "Add error handling to this function"
   - "Replace all console.log with logger.info"
   - "Format this messy code"

3. **Navigation:**
   - "Go to the main function"
   - "Select the entire class definition"
   - "Jump to line 100"

4. **Project Operations:**
   - "Search for all TODO comments"
   - "Show me compilation errors"
   - "Open a terminal and run tests"

5. **Customization:**
   - "Change to dark theme"
   - "Split editor vertically"
   - "Install the Prettier extension"

### Command Chaining

You can chain multiple operations:
```
"Open package.json, find the dependencies section, and tell me what testing frameworks are included"
```

### Context Awareness

Claude understands context from previous commands:
```
"Open utils.js"  
"Add a new function to format dates"  
"Now save the file"
```

## 🔧 Troubleshooting

### Common Issues

1. **Bridge Not Connected:**
   - Ensure VSCode is running
   - Activate bridge: `Ctrl+Shift+P` → "Start Claude MCP Bridge"
   - Check status bar for "🤖 Claude MCP: Online"

2. **File Operations Failing:**
   - Use full file paths when possible
   - Ensure write permissions in workspace
   - Check if file is already open

3. **Commands Not Found:**
   - Verify VSCode extension is installed and active
   - Restart VSCode if needed
   - Check extension logs for errors

### Debug Mode

Enable detailed logging by setting environment variable:
```bash
DEBUG=claude-vscode-controller:* npm start
```

## 📚 Additional Resources

- [VSCode API Documentation](https://code.visualstudio.com/api)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [WebSocket API Reference](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

**Made with ❤️ for seamless Claude ↔ VSCode integration**