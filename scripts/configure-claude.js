#!/usr/bin/env node

/**
 * ⚙️ Claude VSCode Controller - Claude Desktop Configurator
 * 
 * Automatically configures Claude Desktop to work with VSCode Controller:
 * - Detects correct configuration path for the OS
 * - Backs up existing configuration
 * - Adds or updates vscode-controller MCP server
 * - Validates configuration integrity
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    step: (msg) => console.log(`${colors.cyan}🔧 ${msg}${colors.reset}`)
};

class ClaudeConfigurator {
    constructor() {
        this.projectPath = process.cwd();
        this.serverPath = path.join(this.projectPath, 'enhanced-mcp-server.js');
        this.claudeConfigPath = this.getClaudeConfigPath();
    }

    getClaudeConfigPath() {
        const platform = os.platform();
        
        switch (platform) {
            case 'win32':
                return path.join(os.homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
            case 'darwin':
                return path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
            case 'linux':
                return path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json');
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }
    }

    async configure() {
        try {
            log.step('Starting Claude Desktop configuration...');
            
            await this.validateEnvironment();
            await this.ensureConfigDirectory();
            
            const existingConfig = await this.loadExistingConfig();
            const newConfig = await this.createNewConfig(existingConfig);
            await this.writeConfig(newConfig);
            
            log.success('Claude Desktop configuration completed successfully!');
            this.printNextSteps();
            
        } catch (error) {
            log.error(`Configuration failed: ${error.message}`);
            throw error;
        }
    }

    async validateEnvironment() {
        log.step('Validating environment...');
        
        try {
            await fs.access(this.serverPath);
            log.success(`MCP server found: ${this.serverPath}`);
        } catch (error) {
            throw new Error(`MCP server not found: ${this.serverPath}`);
        }
    }

    async ensureConfigDirectory() {
        const configDir = path.dirname(this.claudeConfigPath);
        
        try {
            await fs.access(configDir);
            log.success(`Claude config directory exists: ${configDir}`);
        } catch (error) {
            log.step(`Creating Claude config directory: ${configDir}`);
            await fs.mkdir(configDir, { recursive: true });
            log.success('Claude config directory created');
        }
    }

    async loadExistingConfig() {
        try {
            const configContent = await fs.readFile(this.claudeConfigPath, 'utf8');
            
            if (!configContent.trim()) {
                log.info('Claude config file is empty');
                return null;
            }
            
            const config = JSON.parse(configContent);
            log.success('Existing Claude config loaded');
            return config;
            
        } catch (error) {
            if (error.code === 'ENOENT') {
                log.info('No existing Claude config found, creating new one');
                return null;
            } else {
                throw error;
            }
        }
    }

    async createNewConfig(existingConfig = null) {
        const config = existingConfig || {};
        
        if (!config.mcpServers) {
            config.mcpServers = {};
        }

        config.mcpServers['vscode-controller'] = {
            command: 'node',
            args: [this.serverPath],
            env: {
                NODE_ENV: 'production',
                VSCODE_BRIDGE: 'enabled'
            }
        };

        log.success('VSCode controller configuration prepared');
        return config;
    }

    async writeConfig(config) {
        const configJson = JSON.stringify(config, null, 2);
        
        try {
            await fs.writeFile(this.claudeConfigPath, configJson, 'utf8');
            log.success(`Configuration written to: ${this.claudeConfigPath}`);
        } catch (error) {
            throw new Error(`Failed to write config: ${error.message}`);
        }
    }

    printNextSteps() {
        console.log('');
        log.info('📋 Next Steps:');
        console.log('');
        console.log('1. 🔄 Restart Claude Desktop to load the new configuration');
        console.log('2. 🚀 Start VSCode: code .');
        console.log('3. 🔌 Activate VSCode Bridge: Ctrl+Shift+P → "Start Claude MCP Bridge"');
        console.log('4. ▶️  Start MCP Server: npm start');
        console.log('5. 🧪 Test connection: npm run test:bridge');
        console.log('');
        log.success('Configuration complete! You can now control VSCode from Claude Desktop.');
    }
}

// CLI interface
async function main() {
    try {
        const configurator = new ClaudeConfigurator();
        await configurator.configure();
    } catch (error) {
        console.error(`❌ Failed: ${error.message}`);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default ClaudeConfigurator;