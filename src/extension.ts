import * as vscode from 'vscode';
import { WebSocketServer, WebSocket } from 'ws';

let wss: WebSocketServer | null = null;
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
    console.log('🤖 Claude MCP Controller activated!');
    
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    statusBarItem.text = "$(robot) Claude MCP: Offline";
    statusBarItem.show();
    
    // Start command
    const startCommand = vscode.commands.registerCommand('claude-mcp.start', () => {
        startMCPBridge();
    });
    
    // Stop command
    const stopCommand = vscode.commands.registerCommand('claude-mcp.stop', () => {
        stopMCPBridge();
    });
    
    context.subscriptions.push(startCommand, stopCommand, statusBarItem);
    
    // Auto-start
    startMCPBridge();
}

function startMCPBridge() {
    try {
        wss = new WebSocketServer({ port: 3333 });
        
        wss.on('connection', (ws) => {
            console.log('🔌 Claude MCP connected!');
            statusBarItem.text = "$(robot) Claude MCP: Online";
            
            ws.on('message', (data) => {
                try {
                    const command = JSON.parse(data.toString());
                    handleCommand(command, ws);
                } catch (error) {
                    console.error('Command parsing error:', error);
                }
            });
            
            ws.on('close', () => {
                console.log('🔌 Claude MCP disconnected');
                statusBarItem.text = "$(robot) Claude MCP: Offline";
            });
        });
        
        vscode.window.showInformationMessage('🚀 Claude MCP Bridge started on port 3333');
        
    } catch (error) {
        vscode.window.showErrorMessage(`🔌 Bridge startup error: ${error}`);
    }
}

function stopMCPBridge() {
    if (wss) {
        wss.close();
        wss = null;
        statusBarItem.text = "$(robot) Claude MCP: Offline";
        vscode.window.showInformationMessage('🛑 Claude MCP Bridge stopped');
    }
}

async function handleCommand(command: any, ws: WebSocket) {
    console.log('📨 Received command:', command.method);
    
    let result: any;
    
    try {
        switch (command.method) {
            case 'getActiveEditor':
                result = getActiveEditorInfo();
                break;
                
            case 'getOpenTabs':
                result = getOpenTabs();
                break;
                
            case 'openFile':
                result = await openFile(command.params.filePath);
                break;
                
            case 'createFile':
                result = await createFile(command.params.filePath, command.params.content);
                break;
                
            case 'saveFile':
                result = await saveActiveFile();
                break;
                
            case 'closeFile':
                result = await closeFile(command.params.filePath);
                break;
                
            case 'getWorkspaceInfo':
                result = getWorkspaceInfo();
                break;
                
            case 'executeCommand':
                result = await executeVSCodeCommand(command.params.command, command.params.args);
                break;
                
            case 'showMessage':
                result = showMessage(command.params.message, command.params.type);
                break;
                
            case 'getFileContent':
                result = await getFileContent(command.params.filePath);
                break;
                
            case 'insertText':
                result = await insertText(command.params.text, command.params.position);
                break;
                
            case 'searchInFiles':
                result = await searchInFiles(command.params.searchTerm);
                break;
                
            // ========== ADDITIONAL ADVANCED COMMANDS ==========
            case 'replaceText':
                result = await replaceText(command.params.oldText, command.params.newText, command.params.replaceAll);
                break;
                
            case 'gotoLine':
                result = await gotoLine(command.params.lineNumber, command.params.column);
                break;
                
            case 'selectText':
                result = await selectText(command.params.startLine, command.params.startColumn, command.params.endLine, command.params.endColumn);
                break;
                
            case 'getSelection':
                result = getSelection();
                break;
                
            case 'formatDocument':
                result = await formatDocument();
                break;
                
            case 'findAndReplace':
                result = await findAndReplace(command.params.searchText, command.params.replaceText, command.params.replaceAll);
                break;
                
            case 'getDiagnostics':
                result = getDiagnostics();
                break;
                
            case 'runTask':
                result = await runTask(command.params.taskName);
                break;
                
            case 'openTerminal':
                result = await openTerminal(command.params.name, command.params.cwd);
                break;
                
            case 'sendTerminalCommand':
                result = await sendTerminalCommand(command.params.command, command.params.terminalName);
                break;
                
            case 'getExtensions':
                result = getExtensions();
                break;
                
            case 'installExtension':
                result = await installExtension(command.params.extensionId);
                break;
                
            case 'getThemes':
                result = await getThemes();
                break;
                
            case 'changeTheme':
                result = await changeTheme(command.params.themeName);
                break;
                
            case 'splitEditor':
                result = await splitEditor(command.params.direction);
                break;
                
            case 'closeAllTabs':
                result = await closeAllTabs(command.params.saveAll);
                break;
                
            default:
                result = { error: `Unknown command: ${command.method}` };
        }
    } catch (error: any) {
        result = { error: error.message || error.toString() };
    }
    
    ws.send(JSON.stringify({
        id: command.id,
        result: result
    }));
}

function getActiveEditorInfo() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return null;
    
    return {
        fileName: editor.document.fileName,
        language: editor.document.languageId,
        lineCount: editor.document.lineCount,
        cursorPosition: {
            line: editor.selection.active.line,
            character: editor.selection.active.character
        }
    };
}

function getOpenTabs() {
    const tabs: any[] = [];
    
    vscode.window.tabGroups.all.forEach(group => {
        group.tabs.forEach(tab => {
            if (tab.input instanceof vscode.TabInputText) {
                tabs.push({
                    fileName: tab.input.uri.fsPath,
                    isActive: tab.isActive,
                    isDirty: tab.isDirty
                });
            }
        });
    });
    
    return tabs;
}

async function openFile(filePath: string) {
    try {
        const document = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(document);
        return { success: true, filePath };
    } catch (error: any) {
        return { success: false, error: error.message || error.toString() };
    }
}

async function createFile(filePath: string, content: string = '') {
    try {
        const uri = vscode.Uri.file(filePath);
        await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
        const document = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(document);
        return { success: true, filePath, message: 'File created and opened' };
    } catch (error: any) {
        return { success: false, error: error.message || error.toString() };
    }
}

async function saveActiveFile() {
    try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return { success: false, error: 'No active editor' };
        }
        
        await editor.document.save();
        return { success: true, filePath: editor.document.fileName, message: 'File saved' };
    } catch (error: any) {
        return { success: false, error: error.message || error.toString() };
    }
}

async function closeFile(filePath?: string) {
    try {
        if (filePath) {
            // Close specific file
            const tabs = vscode.window.tabGroups.all.flatMap(group => group.tabs);
            const tab = tabs.find(tab => 
                tab.input instanceof vscode.TabInputText && 
                tab.input.uri.fsPath === filePath
            );
            
            if (tab) {
                await vscode.window.tabGroups.close(tab);
                return { success: true, filePath, message: 'File closed' };
            } else {
                return { success: false, error: 'File is not open' };
            }
        } else {
            // Close active file
            await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
            return { success: true, message: 'Active file closed' };
        }
    } catch (error: any) {
        return { success: false, error: error.message || error.toString() };
    }
}

function getWorkspaceInfo() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    
    if (!workspaceFolders) {
        return { 
            hasWorkspace: false, 
            message: 'No workspace open' 
        };
    }
    
    return {
        hasWorkspace: true,
        folders: workspaceFolders.map(folder => ({
            name: folder.name,
            path: folder.uri.fsPath
        })),
        activeEditor: getActiveEditorInfo()
    };
}

async function executeVSCodeCommand(command: string, args?: any[]) {
    try {
        const result = await vscode.commands.executeCommand(command, ...(args || []));
        return { success: true, command, result };
    } catch (error: any) {
        return { success: false, error: error.message || error.toString() };
    }
}

function showMessage(message: string, type: 'info' | 'warning' | 'error' = 'info') {
    switch (type) {
        case 'info':
            vscode.window.showInformationMessage(message);
            break;
        case 'warning':
            vscode.window.showWarningMessage(message);
            break;
        case 'error':
            vscode.window.showErrorMessage(message);
            break;
    }
    return { success: true, message, type };
}

async function getFileContent(filePath: string) {
    try {
        const document = await vscode.workspace.openTextDocument(filePath);
        return { 
            success: true, 
            filePath, 
            content: document.getText(),
            lineCount: document.lineCount,
            language: document.languageId
        };
    } catch (error: any) {
        return { success: false, error: error.message || error.toString() };
    }
}

async function insertText(text: string, position?: { line: number, character: number }) {
    try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return { success: false, error: 'No active editor' };
        }
        
        const insertPosition = position 
            ? new vscode.Position(position.line, position.character)
            : editor.selection.active;
            
        await editor.edit(editBuilder => {
            editBuilder.insert(insertPosition, text);
        });
        
        return { success: true, text, position: insertPosition };
    } catch (error: any) {
        return { success: false, error: error.message || error.toString() };
    }
}

async function searchInFiles(searchTerm: string) {
    try {
        // Use built-in VSCode search
        await vscode.commands.executeCommand('workbench.action.findInFiles', {
            query: searchTerm,
            triggerSearch: true
        });
        
        return { 
            success: true, 
            searchTerm, 
            message: 'Search started in Search panel' 
        };
    } catch (error: any) {
        return { success: false, error: error.message || error.toString() };
    }
}

export function deactivate() {
    stopMCPBridge();
}

// ========== ADVANCED FUNCTIONS IMPLEMENTATION ==========

async function replaceText(oldText: string, newText: string, replaceAll: boolean = true) {
    try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return { success: false, error: 'No active editor' };
        }
        
        await editor.edit(editBuilder => {
            const text = editor.document.getText();
            const regex = new RegExp(oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), replaceAll ? 'g' : '');
            const match = text.match(regex);
            
            if (match) {
                const document = editor.document;
                const fullRange = new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(text.length)
                );
                
                const newContent = text.replace(regex, newText);
                editBuilder.replace(fullRange, newContent);
            }
        });
        
        return { success: true, oldText, newText, replaceAll };
    } catch (error: any) {
        return { success: false, error: error.message || error.toString() };
    }
}

async function gotoLine(lineNumber: number, column: number = 1) {
    try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return { success: false, error: 'No active editor' };
        }
        
        const position = new vscode.Position(lineNumber - 1, column - 1); // VSCode uses 0-based indexing
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(new vscode.Range(position, position));
        
        return { success: true, line: lineNumber, column };
    } catch (error: any) {
        return { success: false, error: error.message || error.toString() };
    }
}

async function selectText(startLine: number, startColumn: number, endLine: number, endColumn: number) {
    try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return { success: false, error: 'No active editor' };
        }
        
        const startPos = new vscode.Position(startLine - 1, startColumn - 1);
        const endPos = new vscode.Position(endLine - 1, endColumn - 1);
        const selection = new vscode.Selection(startPos, endPos);
        
        editor.selection = selection;
        editor.revealRange(selection);
        
        return { success: true, startLine, startColumn, endLine, endColumn };
    } catch (error: any) {
        return { success: false, error: error.message || error.toString() };
    }
}

function getSelection() {
    try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return { success: false, error: 'No active editor' };
        }
        
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        
        return {
            success: true,
            text: selectedText,
            start: {
                line: selection.start.line + 1,
                character: selection.start.character + 1
            },
            end: {
                line: selection.end.line + 1,
                character: selection.end.character + 1
            },
            isEmpty: selection.isEmpty
        };
    } catch (error: any) {
        return { success: false, error: error.message || error.toString() };
    }
}

async function formatDocument() {
    try {
        await vscode.commands.executeCommand('editor.action.formatDocument');
        return { success: true, message: 'Document formatted' };
    } catch (error: any) {
        return { success: false, error: error.message || error.toString() };
    }
}

async function findAndReplace(searchText: string, replaceText: string, replaceAll: boolean = true) {
    try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return { success: false, error: 'No active editor' };
        }
        
        const document = editor.document;
        const text = document.getText();
        const regex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), replaceAll ? 'g' : '');
        
        const matches = text.match(regex);
        if (!matches) {
            return { success: false, error: 'No text found to replace' };
        }
        
        await editor.edit(editBuilder => {
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(text.length)
            );
            const newContent = text.replace(regex, replaceText);
            editBuilder.replace(fullRange, newContent);
        });
        
        return { 
            success: true, 
            searchText, 
            replaceText, 
            replacements: matches.length,
            replaceAll 
        };
    } catch (error: any) {
        return { success: false, error: error.message || error.toString() };
    }
}

function getDiagnostics() {
    try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return { success: false, error: 'No active editor' };
        }
        
        const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);
        
        const result = diagnostics.map(diagnostic => ({
            message: diagnostic.message,
            severity: vscode.DiagnosticSeverity[diagnostic.severity],
            range: {
                start: {
                    line: diagnostic.range.start.line + 1,
                    character: diagnostic.range.start.character + 1
                },
                end: {
                    line: diagnostic.range.end.line + 1,
                    character: diagnostic.range.end.character + 1
                }
            },
            source: diagnostic.source || 'Unknown'
        }));
        
        return { 
            success: true, 
            diagnostics: result,
            count: result.length,
            file: editor.document.fileName
        };
    } catch (error: any) {
        return { success: false, error: error.message || error.toString() };
    }
}

async function runTask(taskName: string) {
    try {
        const tasks = await vscode.tasks.fetchTasks();
        const task = tasks.find(t => t.name === taskName);
        
        if (!task) {
            return { success: false, error: `Task not found: ${taskName}` };
        }
        
        await vscode.tasks.executeTask(task);
        return { success: true, taskName, message: 'Task started' };
    } catch (error: any) {
        return { success: false, error: error.message || error.toString() };
    }
}

async function openTerminal(name?: string, cwd?: string) {
    try {
        const terminal = vscode.window.createTerminal({
            name: name || 'Claude Terminal',
            cwd: cwd
        });
        
        terminal.show();
        
        return { 
            success: true, 
            name: terminal.name,
            message: 'Terminal opened' 
        };
    } catch (error: any) {
        return { success: false, error: error.message || error.toString() };
    }
}

async function sendTerminalCommand(command: string, terminalName?: string) {
    try {
        let terminal = vscode.window.activeTerminal;
        
        if (terminalName) {
            // Find terminal by name
            terminal = vscode.window.terminals.find(t => t.name === terminalName);
        }
        
        if (!terminal) {
            // Create new terminal if no active terminal
            terminal = vscode.window.createTerminal('Claude Terminal');
        }
        
        terminal.show();
        terminal.sendText(command);
        
        return { 
            success: true, 
            command,
            terminal: terminal.name,
            message: 'Command sent to terminal'
        };
    } catch (error: any) {
        return { success: false, error: error.message || error.toString() };
    }
}

function getExtensions() {
    try {
        const extensions = vscode.extensions.all.map(ext => ({
            id: ext.id,
            displayName: ext.packageJSON.displayName || ext.id,
            version: ext.packageJSON.version,
            isActive: ext.isActive,
            description: ext.packageJSON.description || ''
        }));
        
        return { 
            success: true, 
            extensions,
            count: extensions.length
        };
    } catch (error: any) {
        return { success: false, error: error.message || error.toString() };
    }
}

async function installExtension(extensionId: string) {
    try {
        await vscode.commands.executeCommand('workbench.extensions.installExtension', extensionId);
        return { 
            success: true, 
            extensionId,
            message: `Extension ${extensionId} has been installed`
        };
    } catch (error: any) {
        return { success: false, error: error.message || error.toString() };
    }
}

async function getThemes() {
    try {
        // List of popular VSCode themes
        const builtInThemes = [
            'Default Dark+',
            'Default Light+',
            'Default High Contrast',
            'Monokai',
            'Solarized Dark',
            'Solarized Light',
            'Quiet Light',
            'Red',
            'Kimbie Dark',
            'Abyss'
        ];
        
        return { 
            success: true, 
            themes: builtInThemes,
            count: builtInThemes.length,
            current: vscode.workspace.getConfiguration('workbench').get('colorTheme')
        };
    } catch (error: any) {
        return { success: false, error: error.message || error.toString() };
    }
}

async function changeTheme(themeName: string) {
    try {
        await vscode.workspace.getConfiguration('workbench').update('colorTheme', themeName, true);
        return { 
            success: true, 
            themeName,
            message: `Theme changed to: ${themeName}`
        };
    } catch (error: any) {
        return { success: false, error: error.message || error.toString() };
    }
}

async function splitEditor(direction: 'horizontal' | 'vertical' = 'vertical') {
    try {
        const command = direction === 'horizontal' 
            ? 'workbench.action.splitEditorDown'
            : 'workbench.action.splitEditor';
            
        await vscode.commands.executeCommand(command);
        
        return { 
            success: true, 
            direction,
            message: `Editor split ${direction === 'horizontal' ? 'horizontally' : 'vertically'}`
        };
    } catch (error: any) {
        return { success: false, error: error.message || error.toString() };
    }
}

async function closeAllTabs(saveAll: boolean = true) {
    try {
        if (saveAll) {
            await vscode.commands.executeCommand('workbench.action.files.saveAll');
        }
        
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');
        
        return { 
            success: true, 
            saveAll,
            message: 'All tabs closed'
        };
    } catch (error: any) {
        return { success: false, error: error.message || error.toString() };
    }
}