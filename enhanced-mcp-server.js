#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { spawn, exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import WebSocket from "ws";

const execAsync = promisify(exec);

class EnhancedVSCodeMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "enhanced-vscode-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.vscodeWs = null;
    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupErrorHandling() {
    this.server.onerror = (error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      if (this.vscodeWs) {
        this.vscodeWs.close();
      }
      await this.server.close();
      process.exit(0);
    });
  }

  async connectToVSCode() {
    try {
      this.vscodeWs = new WebSocket("ws://localhost:3333");

      this.vscodeWs.on("open", () => {
        console.error("Connected to VSCode Bridge"); // console.error is not parsed as JSON
      });

      this.vscodeWs.on("error", (error) => {
        console.error("VSCode connection error:", error.message);
        this.vscodeWs = null;
      });

      this.vscodeWs.on("close", () => {
        console.error("VSCode Bridge disconnected");
        this.vscodeWs = null;
      });

      return new Promise((resolve) => {
        this.vscodeWs.on("open", () => resolve(true));
        this.vscodeWs.on("error", () => resolve(false));
      });
    } catch (error) {
      console.error("Error connecting to VSCode:", error);
      return false;
    }
  }

  async sendVSCodeCommand(method, params = {}) {
    if (!this.vscodeWs || this.vscodeWs.readyState !== WebSocket.OPEN) {
      const connected = await this.connectToVSCode();
      if (!connected) {
        throw new Error(
          "Cannot connect to VSCode Bridge. Make sure VSCode is running and Bridge is active."
        );
      }
    }

    return new Promise((resolve, reject) => {
      const id = Date.now().toString();
      const command = { id, method, params };

      const timeout = setTimeout(() => {
        reject(new Error("Timeout waiting for VSCode response"));
      }, 10000);

      const messageHandler = (data) => {
        try {
          const response = JSON.parse(data.toString());
          if (response.id === id) {
            clearTimeout(timeout);
            this.vscodeWs.off("message", messageHandler);
            resolve(response.result);
          }
        } catch (error) {
          // Ignore unparseable messages
        }
      };

      this.vscodeWs.on("message", messageHandler);
      this.vscodeWs.send(JSON.stringify(command));
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // ========== ORIGINAL FILE TOOLS ==========
        {
          name: "open_file",
          description: "Open file in VSCode",
          inputSchema: {
            type: "object",
            properties: {
              filePath: {
                type: "string",
                description: "Path to file to open",
              },
            },
            required: ["filePath"],
          },
        },
        {
          name: "create_file",
          description: "Create new file in VSCode",
          inputSchema: {
            type: "object",
            properties: {
              filePath: {
                type: "string",
                description: "Path to new file",
              },
              content: {
                type: "string",
                description: "File content",
              },
            },
            required: ["filePath", "content"],
          },
        },
        {
          name: "read_file",
          description: "Read file content",
          inputSchema: {
            type: "object",
            properties: {
              filePath: {
                type: "string",
                description: "Path to file to read",
              },
            },
            required: ["filePath"],
          },
        },
        {
          name: "list_files",
          description: "List files in directory",
          inputSchema: {
            type: "object",
            properties: {
              directoryPath: {
                type: "string",
                description: "Directory path",
                default: ".",
              },
            },
          },
        },
        // ========== VSCODE CONTROL TOOLS ==========
        {
          name: "vscode_get_workspace_info",
          description: "Get current VSCode workspace information",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "vscode_get_open_tabs",
          description: "Get list of open tabs in VSCode",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "vscode_get_active_editor",
          description: "Get active editor information in VSCode",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "vscode_open_file",
          description: "Open specific file in VSCode",
          inputSchema: {
            type: "object",
            properties: {
              filePath: {
                type: "string",
                description: "Path to file to open",
              },
            },
            required: ["filePath"],
          },
        },
        {
          name: "vscode_create_file",
          description: "Create new file in VSCode with content",
          inputSchema: {
            type: "object",
            properties: {
              filePath: {
                type: "string",
                description: "Path to new file",
              },
              content: {
                type: "string",
                description: "File content",
                default: "",
              },
            },
            required: ["filePath"],
          },
        },
        {
          name: "vscode_save_file",
          description: "Save active file in VSCode",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "vscode_close_file",
          description: "Close file in VSCode",
          inputSchema: {
            type: "object",
            properties: {
              filePath: {
                type: "string",
                description: "Path to file to close (optional)",
              },
            },
          },
        },
        {
          name: "vscode_get_file_content",
          description: "Get file content through VSCode",
          inputSchema: {
            type: "object",
            properties: {
              filePath: {
                type: "string",
                description: "Path to file",
              },
            },
            required: ["filePath"],
          },
        },
        {
          name: "vscode_insert_text",
          description: "Insert text in active VSCode editor",
          inputSchema: {
            type: "object",
            properties: {
              text: {
                type: "string",
                description: "Text to insert",
              },
              line: {
                type: "number",
                description: "Line number (optional)",
              },
              character: {
                type: "number",
                description: "Character position (optional)",
              },
            },
            required: ["text"],
          },
        },
        {
          name: "vscode_replace_text",
          description: "Replace text in active VSCode file",
          inputSchema: {
            type: "object",
            properties: {
              oldText: {
                type: "string",
                description: "Old text",
              },
              newText: {
                type: "string",
                description: "New text",
              },
              replaceAll: {
                type: "boolean",
                description: "Replace all occurrences",
                default: true,
              },
            },
            required: ["oldText", "newText"],
          },
        },
        {
          name: "vscode_find_and_replace",
          description: "Find and replace text in active file",
          inputSchema: {
            type: "object",
            properties: {
              searchText: {
                type: "string",
                description: "Search text",
              },
              replaceText: {
                type: "string",
                description: "Replacement text",
              },
              replaceAll: {
                type: "boolean",
                description: "Replace all occurrences",
                default: true,
              },
            },
            required: ["searchText", "replaceText"],
          },
        },
        {
          name: "vscode_goto_line",
          description: "Go to specific line in active editor",
          inputSchema: {
            type: "object",
            properties: {
              lineNumber: {
                type: "number",
                description: "Line number (starting from 1)",
              },
              column: {
                type: "number",
                description: "Column number (optional)",
                default: 1,
              },
            },
            required: ["lineNumber"],
          },
        },
        {
          name: "vscode_select_text",
          description: "Select text in active editor",
          inputSchema: {
            type: "object",
            properties: {
              startLine: {
                type: "number",
                description: "Start line",
              },
              startColumn: {
                type: "number",
                description: "Start column",
              },
              endLine: {
                type: "number",
                description: "End line",
              },
              endColumn: {
                type: "number",
                description: "End column",
              },
            },
            required: ["startLine", "startColumn", "endLine", "endColumn"],
          },
        },
        {
          name: "vscode_get_selection",
          description: "Get selected text from active editor",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "vscode_format_document",
          description: "Format active document in VSCode",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "vscode_get_diagnostics",
          description: "Get errors and warnings from active file",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "vscode_search_in_files",
          description: "Search text in files in VSCode",
          inputSchema: {
            type: "object",
            properties: {
              searchTerm: {
                type: "string",
                description: "Text to search",
              },
            },
            required: ["searchTerm"],
          },
        },
        {
          name: "vscode_execute_command",
          description: "Execute VSCode command",
          inputSchema: {
            type: "object",
            properties: {
              command: {
                type: "string",
                description: "VSCode command to execute",
              },
              args: {
                type: "array",
                description: "Command arguments (optional)",
              },
            },
            required: ["command"],
          },
        },
        {
          name: "vscode_show_message",
          description: "Show message in VSCode",
          inputSchema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description: "Message to display",
              },
              type: {
                type: "string",
                enum: ["info", "warning", "error"],
                description: "Message type",
                default: "info",
              },
            },
            required: ["message"],
          },
        },
        {
          name: "vscode_open_terminal",
          description: "Open terminal in VSCode",
          inputSchema: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Terminal name (optional)",
              },
              cwd: {
                type: "string",
                description: "Working directory (optional)",
              },
            },
          },
        },
        {
          name: "vscode_send_terminal_command",
          description: "Send command to VSCode terminal",
          inputSchema: {
            type: "object",
            properties: {
              command: {
                type: "string",
                description: "Command to execute",
              },
              terminalName: {
                type: "string",
                description: "Terminal name (optional)",
              },
            },
            required: ["command"],
          },
        },
        {
          name: "vscode_get_extensions",
          description: "Get list of installed VSCode extensions",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "vscode_install_extension",
          description: "Install VSCode extension",
          inputSchema: {
            type: "object",
            properties: {
              extensionId: {
                type: "string",
                description: "Extension ID to install",
              },
            },
            required: ["extensionId"],
          },
        },
        {
          name: "vscode_get_themes",
          description: "Get list of available VSCode themes",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "vscode_change_theme",
          description: "Change VSCode theme",
          inputSchema: {
            type: "object",
            properties: {
              themeName: {
                type: "string",
                description: "Theme name",
              },
            },
            required: ["themeName"],
          },
        },
        {
          name: "vscode_split_editor",
          description: "Split VSCode editor",
          inputSchema: {
            type: "object",
            properties: {
              direction: {
                type: "string",
                enum: ["horizontal", "vertical"],
                description: "Split direction",
                default: "vertical",
              },
            },
          },
        },
        {
          name: "vscode_close_all_tabs",
          description: "Close all tabs in VSCode",
          inputSchema: {
            type: "object",
            properties: {
              saveAll: {
                type: "boolean",
                description: "Save all files before closing",
                default: true,
              },
            },
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          // ========== ORIGINAL COMMANDS ==========
          case "open_file":
            return await this.openFile(args.filePath);
          case "create_file":
            return await this.createFile(args.filePath, args.content);
          case "read_file":
            return await this.readFile(args.filePath);
          case "list_files":
            return await this.listFiles(args.directoryPath || ".");

          // ========== VSCODE CONTROL COMMANDS ==========
          case "vscode_get_workspace_info":
            return await this.vscodeGetWorkspaceInfo();
          case "vscode_get_open_tabs":
            return await this.vscodeGetOpenTabs();
          case "vscode_get_active_editor":
            return await this.vscodeGetActiveEditor();
          case "vscode_open_file":
            return await this.vscodeOpenFile(args.filePath);
          case "vscode_create_file":
            return await this.vscodeCreateFile(args.filePath, args.content);
          case "vscode_save_file":
            return await this.vscodeSaveFile();
          case "vscode_close_file":
            return await this.vscodeCloseFile(args.filePath);
          case "vscode_get_file_content":
            return await this.vscodeGetFileContent(args.filePath);
          case "vscode_insert_text":
            return await this.vscodeInsertText(
              args.text,
              args.line,
              args.character
            );
          case "vscode_replace_text":
            return await this.vscodeReplaceText(
              args.oldText,
              args.newText,
              args.replaceAll
            );
          case "vscode_find_and_replace":
            return await this.vscodeFindAndReplace(
              args.searchText,
              args.replaceText,
              args.replaceAll
            );
          case "vscode_goto_line":
            return await this.vscodeGotoLine(args.lineNumber, args.column);
          case "vscode_select_text":
            return await this.vscodeSelectText(
              args.startLine,
              args.startColumn,
              args.endLine,
              args.endColumn
            );
          case "vscode_get_selection":
            return await this.vscodeGetSelection();
          case "vscode_format_document":
            return await this.vscodeFormatDocument();
          case "vscode_get_diagnostics":
            return await this.vscodeGetDiagnostics();
          case "vscode_search_in_files":
            return await this.vscodeSearchInFiles(args.searchTerm);
          case "vscode_execute_command":
            return await this.vscodeExecuteCommand(args.command, args.args);
          case "vscode_show_message":
            return await this.vscodeShowMessage(args.message, args.type);
          case "vscode_open_terminal":
            return await this.vscodeOpenTerminal(args.name, args.cwd);
          case "vscode_send_terminal_command":
            return await this.vscodeSendTerminalCommand(
              args.command,
              args.terminalName
            );
          case "vscode_get_extensions":
            return await this.vscodeGetExtensions();
          case "vscode_install_extension":
            return await this.vscodeInstallExtension(args.extensionId);
          case "vscode_get_themes":
            return await this.vscodeGetThemes();
          case "vscode_change_theme":
            return await this.vscodeChangeTheme(args.themeName);
          case "vscode_split_editor":
            return await this.vscodeSplitEditor(args.direction);
          case "vscode_close_all_tabs":
            return await this.vscodeCloseAllTabs(args.saveAll);

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown command: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing ${name}: ${error.message}`
        );
      }
    });
  }

  // ========== ORIGINAL METHODS ==========
  async openFile(filePath) {
    try {
      const absolutePath = path.resolve(filePath);
      await execAsync(`code "${absolutePath}"`);
      return {
        content: [
          {
            type: "text",
            text: `File ${filePath} opened in VSCode`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Cannot open file: ${error.message}`);
    }
  }

  async createFile(filePath, content) {
    try {
      const absolutePath = path.resolve(filePath);
      const dir = path.dirname(absolutePath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(absolutePath, content, "utf8");
      await execAsync(`code "${absolutePath}"`);
      return {
        content: [
          {
            type: "text",
            text: `File ${filePath} created and opened in VSCode`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Cannot create file: ${error.message}`);
    }
  }

  async readFile(filePath) {
    try {
      const absolutePath = path.resolve(filePath);
      const content = await fs.readFile(absolutePath, "utf8");
      return {
        content: [
          {
            type: "text",
            text: `Content of ${filePath}:\n\n${content}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Cannot read file: ${error.message}`);
    }
  }

  async listFiles(directoryPath) {
    try {
      const absolutePath = path.resolve(directoryPath);
      const files = await fs.readdir(absolutePath, { withFileTypes: true });
      const fileList = files.map((file) => ({
        name: file.name,
        type: file.isDirectory() ? "directory" : "file",
        path: path.join(directoryPath, file.name),
      }));
      return {
        content: [
          {
            type: "text",
            text: `Files in ${directoryPath}:\n\n${fileList
              .map((f) => `${f.type}: ${f.name}`)
              .join("\n")}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Cannot read directory: ${error.message}`);
    }
  }

  // ========== VSCODE CONTROL METHODS ==========
  async vscodeGetWorkspaceInfo() {
    try {
      const result = await this.sendVSCodeCommand("getWorkspaceInfo");
      return {
        content: [
          {
            type: "text",
            text: `VSCode workspace info:\n\n${JSON.stringify(
              result,
              null,
              2
            )}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error getting workspace info: ${error.message}`,
          },
        ],
      };
    }
  }

  async vscodeGetOpenTabs() {
    try {
      const result = await this.sendVSCodeCommand("getOpenTabs");
      const tabs = result || [];
      return {
        content: [
          {
            type: "text",
            text: `Open tabs in VSCode (${tabs.length}):\n\n${tabs
              .map(
                (tab) =>
                  `${tab.isActive ? "📍" : "📄"} ${path.basename(
                    tab.fileName
                  )}${tab.isDirty ? " (*)" : ""}\n   ${tab.fileName}`
              )
              .join("\n\n")}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error getting open tabs: ${error.message}`,
          },
        ],
      };
    }
  }

  async vscodeGetActiveEditor() {
    try {
      const result = await this.sendVSCodeCommand("getActiveEditor");
      if (!result) {
        return {
          content: [
            {
              type: "text",
              text: "No active editor in VSCode",
            },
          ],
        };
      }
      return {
        content: [
          {
            type: "text",
            text: `Active editor in VSCode:\n\n📄 File: ${
              result.fileName
            }\n🔤 Language: ${result.language}\n📊 Lines: ${
              result.lineCount
            }\n📍 Cursor: line ${result.cursorPosition.line + 1}, column ${
              result.cursorPosition.character + 1
            }`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error getting active editor info: ${error.message}`,
          },
        ],
      };
    }
  }

  async vscodeOpenFile(filePath) {
    try {
      const result = await this.sendVSCodeCommand("openFile", { filePath });
      return {
        content: [
          {
            type: "text",
            text: result.success
              ? `✅ File ${filePath} opened in VSCode`
              : `❌ Error opening file: ${result.error}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error opening file: ${error.message}`,
          },
        ],
      };
    }
  }

  async vscodeCreateFile(filePath, content = "") {
    try {
      const result = await this.sendVSCodeCommand("createFile", {
        filePath,
        content,
      });
      return {
        content: [
          {
            type: "text",
            text: result.success
              ? `✅ File ${filePath} created and opened in VSCode`
              : `❌ Error creating file: ${result.error}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error creating file: ${error.message}`,
          },
        ],
      };
    }
  }

  async vscodeSaveFile() {
    try {
      const result = await this.sendVSCodeCommand("saveFile");
      return {
        content: [
          {
            type: "text",
            text: result.success
              ? `✅ File saved: ${result.filePath}`
              : `❌ Error saving: ${result.error}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error saving file: ${error.message}`,
          },
        ],
      };
    }
  }

  async vscodeCloseFile(filePath) {
    try {
      const result = await this.sendVSCodeCommand("closeFile", { filePath });
      return {
        content: [
          {
            type: "text",
            text: result.success
              ? `✅ ${result.message}`
              : `❌ Error closing file: ${result.error}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error closing file: ${error.message}`,
          },
        ],
      };
    }
  }

  async vscodeGetFileContent(filePath) {
    try {
      const result = await this.sendVSCodeCommand("getFileContent", {
        filePath,
      });
      if (result.success) {
        return {
          content: [
            {
              type: "text",
              text: `Content of ${filePath} (${result.lineCount} lines, language: ${result.language}):\n\n${result.content}`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: `❌ Error reading file: ${result.error}`,
            },
          ],
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error reading file: ${error.message}`,
          },
        ],
      };
    }
  }

  async vscodeInsertText(text, line, character) {
    try {
      const params = { text };
      if (line !== undefined && character !== undefined) {
        params.position = { line, character };
      }
      const result = await this.sendVSCodeCommand("insertText", params);
      return {
        content: [
          {
            type: "text",
            text: result.success
              ? `✅ Text inserted in VSCode`
              : `❌ Error inserting text: ${result.error}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error inserting text: ${error.message}`,
          },
        ],
      };
    }
  }

  async vscodeReplaceText(oldText, newText, replaceAll = true) {
    try {
      const result = await this.sendVSCodeCommand("replaceText", {
        oldText,
        newText,
        replaceAll,
      });
      return {
        content: [
          {
            type: "text",
            text: result.success
              ? `✅ Text replaced in VSCode (${
                  replaceAll ? "all" : "first"
                } occurrences)`
              : `❌ Error replacing text: ${result.error}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error replacing text: ${error.message}`,
          },
        ],
      };
    }
  }

  async vscodeFindAndReplace(searchText, replaceText, replaceAll = true) {
    try {
      const result = await this.sendVSCodeCommand("findAndReplace", {
        searchText,
        replaceText,
        replaceAll,
      });
      return {
        content: [
          {
            type: "text",
            text: result.success
              ? `✅ Replaced ${
                  result.replacements || 0
                } occurrences of "${searchText}" with "${replaceText}" in VSCode`
              : `❌ Error find and replace: ${result.error}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error find and replace: ${error.message}`,
          },
        ],
      };
    }
  }

  async vscodeGotoLine(lineNumber, column = 1) {
    try {
      const result = await this.sendVSCodeCommand("gotoLine", {
        lineNumber,
        column,
      });
      return {
        content: [
          {
            type: "text",
            text: result.success
              ? `✅ Went to line ${lineNumber}, column ${column} in VSCode`
              : `❌ Error going to line: ${result.error}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error going to line: ${error.message}`,
          },
        ],
      };
    }
  }

  async vscodeSelectText(startLine, startColumn, endLine, endColumn) {
    try {
      const result = await this.sendVSCodeCommand("selectText", {
        startLine,
        startColumn,
        endLine,
        endColumn,
      });
      return {
        content: [
          {
            type: "text",
            text: result.success
              ? `✅ Selected text in VSCode (line ${startLine}:${startColumn} to ${endLine}:${endColumn})`
              : `❌ Error selecting text: ${result.error}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error selecting text: ${error.message}`,
          },
        ],
      };
    }
  }

  async vscodeGetSelection() {
    try {
      const result = await this.sendVSCodeCommand("getSelection");
      if (result.success) {
        return {
          content: [
            {
              type: "text",
              text: result.isEmpty
                ? "No selection in VSCode"
                : `Selected text in VSCode:\n\n"${result.text}"\n\nPosition: line ${result.start.line}:${result.start.character} to ${result.end.line}:${result.end.character}`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: `❌ Error getting selection: ${result.error}`,
            },
          ],
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error getting selection: ${error.message}`,
          },
        ],
      };
    }
  }

  async vscodeFormatDocument() {
    try {
      const result = await this.sendVSCodeCommand("formatDocument");
      return {
        content: [
          {
            type: "text",
            text: result.success
              ? `✅ Document formatted in VSCode`
              : `❌ Error formatting document: ${result.error}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error formatting document: ${error.message}`,
          },
        ],
      };
    }
  }

  async vscodeGetDiagnostics() {
    try {
      const result = await this.sendVSCodeCommand("getDiagnostics");
      if (result.success) {
        if (result.count === 0) {
          return {
            content: [
              {
                type: "text",
                text: `✅ No errors or warnings in active VSCode file`,
              },
            ],
          };
        } else {
          const diagnosticsText = result.diagnostics
            .map(
              (d) =>
                `🔸 ${d.severity}: ${d.message} (line ${d.range.start.line}:${d.range.start.character})`
            )
            .join("\n");

          return {
            content: [
              {
                type: "text",
                text: `VSCode diagnostics (${result.count} problems):\n\n${diagnosticsText}`,
              },
            ],
          };
        }
      } else {
        return {
          content: [
            {
              type: "text",
              text: `❌ Error getting diagnostics: ${result.error}`,
            },
          ],
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error getting diagnostics: ${error.message}`,
          },
        ],
      };
    }
  }

  async vscodeSearchInFiles(searchTerm) {
    try {
      const result = await this.sendVSCodeCommand("searchInFiles", {
        searchTerm,
      });
      return {
        content: [
          {
            type: "text",
            text: result.success
              ? `✅ Search for "${searchTerm}" started in VSCode`
              : `❌ Error searching: ${result.error}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error searching: ${error.message}`,
          },
        ],
      };
    }
  }

  async vscodeExecuteCommand(command, args) {
    try {
      const result = await this.sendVSCodeCommand("executeCommand", {
        command,
        args,
      });
      return {
        content: [
          {
            type: "text",
            text: result.success
              ? `✅ Command "${command}" executed in VSCode`
              : `❌ Error executing command: ${result.error}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error executing command: ${error.message}`,
          },
        ],
      };
    }
  }

  async vscodeShowMessage(message, type = "info") {
    try {
      const result = await this.sendVSCodeCommand("showMessage", {
        message,
        type,
      });
      return {
        content: [
          {
            type: "text",
            text: result.success
              ? `✅ Message displayed in VSCode: "${message}"`
              : `❌ Error showing message: ${result.error}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error showing message: ${error.message}`,
          },
        ],
      };
    }
  }

  async vscodeOpenTerminal(name, cwd) {
    try {
      const result = await this.sendVSCodeCommand("openTerminal", {
        name,
        cwd,
      });
      return {
        content: [
          {
            type: "text",
            text: result.success
              ? `✅ Terminal "${result.name}" opened in VSCode`
              : `❌ Error opening terminal: ${result.error}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error opening terminal: ${error.message}`,
          },
        ],
      };
    }
  }

  async vscodeSendTerminalCommand(command, terminalName) {
    try {
      const result = await this.sendVSCodeCommand("sendTerminalCommand", {
        command,
        terminalName,
      });
      return {
        content: [
          {
            type: "text",
            text: result.success
              ? `✅ Command "${command}" sent to terminal "${result.terminal}" in VSCode`
              : `❌ Error sending command: ${result.error}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error sending command: ${error.message}`,
          },
        ],
      };
    }
  }

  async vscodeGetExtensions() {
    try {
      const result = await this.sendVSCodeCommand("getExtensions");
      if (result.success) {
        const extensionsText = result.extensions
          .slice(0, 20)
          .map(
            (ext) =>
              `🔸 ${ext.displayName} (${ext.id}) v${ext.version} ${
                ext.isActive ? "✅" : "⏸️"
              }`
          )
          .join("\n");

        return {
          content: [
            {
              type: "text",
              text: `VSCode extensions (${result.count} total, showing 20):\n\n${extensionsText}`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: `❌ Error getting extensions: ${result.error}`,
            },
          ],
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error getting extensions: ${error.message}`,
          },
        ],
      };
    }
  }

  async vscodeInstallExtension(extensionId) {
    try {
      const result = await this.sendVSCodeCommand("installExtension", {
        extensionId,
      });
      return {
        content: [
          {
            type: "text",
            text: result.success
              ? `✅ Extension "${extensionId}" installed in VSCode`
              : `❌ Error installing extension: ${result.error}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error installing extension: ${error.message}`,
          },
        ],
      };
    }
  }

  async vscodeGetThemes() {
    try {
      const result = await this.sendVSCodeCommand("getThemes");
      if (result.success) {
        return {
          content: [
            {
              type: "text",
              text: `Available VSCode themes:\n\n${result.themes.join(
                "\n"
              )}\n\nCurrent theme: ${result.current}`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: `❌ Error getting themes: ${result.error}`,
            },
          ],
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error getting themes: ${error.message}`,
          },
        ],
      };
    }
  }

  async vscodeChangeTheme(themeName) {
    try {
      const result = await this.sendVSCodeCommand("changeTheme", { themeName });
      return {
        content: [
          {
            type: "text",
            text: result.success
              ? `✅ VSCode theme changed to "${themeName}"`
              : `❌ Error changing theme: ${result.error}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error changing theme: ${error.message}`,
          },
        ],
      };
    }
  }

  async vscodeSplitEditor(direction = "vertical") {
    try {
      const result = await this.sendVSCodeCommand("splitEditor", { direction });
      return {
        content: [
          {
            type: "text",
            text: result.success
              ? `✅ VSCode editor split ${
                  direction === "horizontal" ? "horizontally" : "vertically"
                }`
              : `❌ Error splitting editor: ${result.error}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error splitting editor: ${error.message}`,
          },
        ],
      };
    }
  }

  async vscodeCloseAllTabs(saveAll = true) {
    try {
      const result = await this.sendVSCodeCommand("closeAllTabs", { saveAll });
      return {
        content: [
          {
            type: "text",
            text: result.success
              ? `✅ All tabs closed in VSCode ${
                  saveAll ? "(with save)" : "(without save)"
                }`
              : `❌ Error closing tabs: ${result.error}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error closing tabs: ${error.message}`,
          },
        ],
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Enhanced VSCode MCP Server started");
    console.error("Connecting to VSCode Bridge...");

    // Try to connect to VSCode on startup
    await this.connectToVSCode();
  }
}

const server = new EnhancedVSCodeMCPServer();
server.run().catch(console.error);
