#!/usr/bin/env node

/**
 * 🩺 Claude VSCode Controller - Diagnostic Tool
 * 
 * Comprehensive health check for the entire system:
 * - System requirements
 * - Installation integrity
 * - Configuration validation
 * - Connection testing
 * - Performance checks
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import net from 'net';

const execAsync = promisify(exec);

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    step: (msg) => console.log(`${colors.cyan}🔍 ${msg}${colors.reset}`),
    header: (msg) => console.log(`${colors.bright}${colors.white}${msg}${colors.reset}`)
};

class DiagnosticTool {
    constructor() {
        this.results = {
            system: [],
            installation: [],
            configuration: [],
            connectivity: [],
            performance: []
        };
        this.overallHealth = 'healthy';
    }

    async run() {
        log.header('🩺 Claude VSCode Controller - System Diagnostics');
        log.header('='.repeat(60));
        
        await this.checkSystemRequirements();
        await this.checkInstallation();
        await this.checkConfiguration();
        await this.checkConnectivity();
        await this.checkPerformance();
        
        this.generateReport();
        this.provideFixes();
    }

    async checkSystemRequirements() {
        log.step('Checking system requirements...');
        
        // Operating System
        const platform = os.platform();
        const arch = os.arch();
        const osVersion = os.release();
        
        if (['win32', 'darwin', 'linux'].includes(platform)) {
            this.addResult('system', 'success', `Operating System: ${platform} ${arch} (${osVersion})`);
        } else {
            this.addResult('system', 'error', `Unsupported OS: ${platform}`);
        }

        // Node.js
        try {
            const nodeVersion = process.version;
            const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
            
            if (majorVersion >= 18) {
                this.addResult('system', 'success', `Node.js: ${nodeVersion}`);
            } else {
                this.addResult('system', 'error', `Node.js ${nodeVersion} is too old. Requires 18+`);
            }
        } catch (error) {
            this.addResult('system', 'error', `Node.js not found: ${error.message}`);
        }

        // npm
        try {
            const { stdout } = await execAsync('npm --version');
            this.addResult('system', 'success', `npm: ${stdout.trim()}`);
        } catch (error) {
            this.addResult('system', 'error', `npm not found: ${error.message}`);
        }

        // VSCode
        try {
            const { stdout } = await execAsync('code --version');
            const version = stdout.split('\n')[0];
            this.addResult('system', 'success', `VSCode: ${version}`);
        } catch (error) {
            this.addResult('system', 'error', `VSCode not found or not in PATH: ${error.message}`);
        }

        // Memory
        const totalMemory = Math.round(os.totalmem() / 1024 / 1024 / 1024);
        const freeMemory = Math.round(os.freemem() / 1024 / 1024 / 1024);
        
        if (totalMemory >= 4) {
            this.addResult('system', 'success', `Memory: ${freeMemory}GB free / ${totalMemory}GB total`);
        } else {
            this.addResult('system', 'warning', `Low memory: ${totalMemory}GB total (recommended: 4GB+)`);
        }
    }

    async checkInstallation() {
        log.step('Checking installation integrity...');
        
        const projectRoot = process.cwd();
        
        // Core files
        const requiredFiles = [
            'package.json',
            'enhanced-mcp-server.js',
            'tsconfig.json'
        ];

        for (const file of requiredFiles) {
            try {
                await fs.access(path.join(projectRoot, file));
                this.addResult('installation', 'success', `Found: ${file}`);
            } catch (error) {
                this.addResult('installation', 'error', `Missing: ${file}`);
            }
        }

        // Compiled extension
        try {
            await fs.access(path.join(projectRoot, 'out', 'extension.js'));
            this.addResult('installation', 'success', 'Extension compiled: out/extension.js');
        } catch (error) {
            this.addResult('installation', 'error', 'Extension not compiled. Run: npm run build');
        }

        // VSCode extension installation
        const extensionPath = path.join(os.homedir(), '.vscode', 'extensions', 'claude-mcp-controller');
        try {
            await fs.access(extensionPath);
            this.addResult('installation', 'success', 'VSCode extension installed');
        } catch (error) {
            this.addResult('installation', 'error', 'VSCode extension not installed');
        }
    }

    async checkConfiguration() {
        log.step('Checking configuration...');
        
        // Claude Desktop configuration
        let claudeConfigPath;
        const platform = os.platform();
        
        if (platform === 'win32') {
            claudeConfigPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
        } else if (platform === 'darwin') {
            claudeConfigPath = path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
        } else {
            claudeConfigPath = path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json');
        }

        try {
            const configContent = await fs.readFile(claudeConfigPath, 'utf8');
            const config = JSON.parse(configContent);
            
            this.addResult('configuration', 'success', `Claude config found: ${claudeConfigPath}`);
            
            // Check MCP server configuration
            if (config.mcpServers && config.mcpServers['vscode-controller']) {
                this.addResult('configuration', 'success', 'VSCode controller configured in Claude');
            } else {
                this.addResult('configuration', 'error', 'VSCode controller not configured in Claude');
            }
        } catch (error) {
            this.addResult('configuration', 'error', `Claude config not found or invalid: ${error.message}`);
        }
    }

    async checkConnectivity() {
        log.step('Checking connectivity...');
        
        // Check WebSocket port 3333
        const portOpen = await this.checkPort(3333);
        if (portOpen) {
            this.addResult('connectivity', 'success', 'Port 3333 is open (Bridge active)');
        } else {
            this.addResult('connectivity', 'warning', 'Port 3333 is closed (Bridge not active)');
        }

        // Test WebSocket connection
        if (portOpen) {
            try {
                await this.testWebSocketConnection();
                this.addResult('connectivity', 'success', 'WebSocket connection successful');
            } catch (error) {
                this.addResult('connectivity', 'error', `WebSocket test failed: ${error.message}`);
            }
        }
    }

    async checkPerformance() {
        log.step('Checking performance...');
        
        // CPU usage
        const cpus = os.cpus();
        this.addResult('performance', 'info', `CPU: ${cpus.length} cores @ ${cpus[0].speed}MHz`);

        // Memory usage
        const used = process.memoryUsage();
        const heapUsed = Math.round(used.heapUsed / 1024 / 1024);
        const heapTotal = Math.round(used.heapTotal / 1024 / 1024);
        
        if (heapUsed < 100) {
            this.addResult('performance', 'success', `Memory usage: ${heapUsed}MB / ${heapTotal}MB`);
        } else {
            this.addResult('performance', 'warning', `High memory usage: ${heapUsed}MB / ${heapTotal}MB`);
        }
    }

    async checkPort(port) {
        return new Promise((resolve) => {
            const socket = new net.Socket();
            
            socket.setTimeout(1000);
            socket.on('connect', () => {
                socket.destroy();
                resolve(true);
            });
            
            socket.on('timeout', () => {
                socket.destroy();
                resolve(false);
            });
            
            socket.on('error', () => {
                resolve(false);
            });
            
            socket.connect(port, 'localhost');
        });
    }

    async testWebSocketConnection() {
        return new Promise((resolve, reject) => {
            try {
                import('ws').then(({ default: WebSocket }) => {
                    const ws = new WebSocket('ws://localhost:3333');
                    
                    const timeout = setTimeout(() => {
                        ws.close();
                        reject(new Error('Connection timeout'));
                    }, 5000);
                    
                    ws.on('open', () => {
                        clearTimeout(timeout);
                        ws.close();
                        resolve();
                    });
                    
                    ws.on('error', (error) => {
                        clearTimeout(timeout);
                        reject(error);
                    });
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    addResult(category, level, message) {
        this.results[category].push({ level, message });
        
        if (level === 'error') {
            this.overallHealth = 'critical';
        } else if (level === 'warning' && this.overallHealth === 'healthy') {
            this.overallHealth = 'warning';
        }
    }

    generateReport() {
        console.log('\n');
        log.header('📊 DIAGNOSTIC REPORT');
        log.header('='.repeat(60));

        const categories = [
            { key: 'system', name: 'System Requirements' },
            { key: 'installation', name: 'Installation' },
            { key: 'configuration', name: 'Configuration' },
            { key: 'connectivity', name: 'Connectivity' },
            { key: 'performance', name: 'Performance' }
        ];

        for (const category of categories) {
            console.log(`\n${colors.bright}${category.name}:${colors.reset}`);
            
            const results = this.results[category.key];
            if (results.length === 0) {
                log.info('No issues found');
                continue;
            }

            for (const result of results) {
                switch (result.level) {
                    case 'success':
                        log.success(result.message);
                        break;
                    case 'warning':
                        log.warning(result.message);
                        break;
                    case 'error':
                        log.error(result.message);
                        break;
                    case 'info':
                        log.info(result.message);
                        break;
                }
            }
        }

        // Overall health status
        console.log('\n');
        log.header('🏥 OVERALL HEALTH STATUS');
        
        switch (this.overallHealth) {
            case 'healthy':
                log.success('System is healthy and ready to use!');
                break;
            case 'warning':
                log.warning('System has minor issues but should work');
                break;
            case 'critical':
                log.error('System has critical issues that need attention');
                break;
        }
    }

    provideFixes() {
        console.log('\n');
        log.header('🔧 RECOMMENDED FIXES');
        log.header('='.repeat(60));

        const errors = [];
        const warnings = [];

        for (const category of Object.keys(this.results)) {
            for (const result of this.results[category]) {
                if (result.level === 'error') {
                    errors.push(result.message);
                } else if (result.level === 'warning') {
                    warnings.push(result.message);
                }
            }
        }

        if (errors.length === 0 && warnings.length === 0) {
            log.success('No fixes needed! Your system is working perfectly.');
            return;
        }

        if (errors.length > 0) {
            console.log(`\n${colors.red}${colors.bright}Critical Issues:${colors.reset}`);
            for (const error of errors) {
                log.error(error);
                this.suggestFix(error);
            }
        }

        if (warnings.length > 0) {
            console.log(`\n${colors.yellow}${colors.bright}Warnings:${colors.reset}`);
            for (const warning of warnings) {
                log.warning(warning);
                this.suggestFix(warning);
            }
        }

        console.log('\n');
        log.info('For more help, visit: https://github.com/dar-kow/claude-vscode-controller/issues');
    }

    suggestFix(issue) {
        const fixes = {
            'VSCode not found': '  💡 Install VSCode from https://code.visualstudio.com/ and add to PATH',
            'Node.js': '  💡 Update Node.js to version 18+ from https://nodejs.org/',
            'npm not found': '  💡 Install npm (usually comes with Node.js)',
            'Extension not compiled': '  💡 Run: npm run build',
            'VSCode extension not installed': '  💡 Run: npm run install-extension',
            'Dependencies': '  💡 Run: npm install',
            'Claude config': '  💡 Run: npm run configure-claude',
            'Bridge not active': '  💡 In VSCode: Ctrl+Shift+P → "Start Claude MCP Bridge"',
            'VSCode is not running': '  💡 Start VSCode: code .',
            'WebSocket test failed': '  💡 Restart VSCode Bridge and MCP Server'
        };

        for (const [key, fix] of Object.entries(fixes)) {
            if (issue.includes(key)) {
                console.log(fix);
                break;
            }
        }
    }
}

// Run diagnostics
if (import.meta.url === `file://${process.argv[1]}`) {
    const doctor = new DiagnosticTool();
    doctor.run().catch(console.error);
}

export default DiagnosticTool;
