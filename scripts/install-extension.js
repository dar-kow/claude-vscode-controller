#!/usr/bin/env node

/**
 * 🔌 Claude VSCode Controller - Extension Installer
 * 
 * Automatically installs the VSCode extension for Claude MCP Bridge
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

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

class ExtensionInstaller {
    constructor() {
        this.projectPath = process.cwd();
        this.extensionSourcePath = this.projectPath;
        this.vscodeExtensionsPath = path.join(os.homedir(), '.vscode', 'extensions', 'claude-mcp-controller');
    }

    async install() {
        try {
            log.step('Starting VSCode extension installation...');
            
            await this.validateEnvironment();
            await this.buildExtension();
            await this.installExtension();
            await this.verifyInstallation();
            
            log.success('VSCode extension installed successfully!');
            this.printNextSteps();
            
        } catch (error) {
            log.error(`Extension installation failed: ${error.message}`);
            throw error;
        }
    }

    async validateEnvironment() {
        log.step('Validating environment...');
        
        // Check if TypeScript is available
        try {
            await this.execCommand('tsc --version');
            log.success('TypeScript compiler found');
        } catch (error) {
            throw new Error('TypeScript not found. Please install: npm install -g typescript');
        }

        // Check source files
        const requiredFiles = [
            'src/extension.ts',
            'package-extension.json',
            'tsconfig.json'
        ];

        for (const file of requiredFiles) {
            try {
                await fs.access(path.join(this.projectPath, file));
                log.success(`Found: ${file}`);
            } catch (error) {
                throw new Error(`Missing required file: ${file}`);
            }
        }
    }

    async buildExtension() {
        log.step('Building TypeScript extension...');
        
        try {
            await this.execCommand('tsc -p .');
            
            // Verify output
            const outputFile = path.join(this.projectPath, 'out', 'extension.js');
            await fs.access(outputFile);
            log.success('Extension compiled successfully');
        } catch (error) {
            throw new Error(`Extension build failed: ${error.message}`);
        }
    }

    async installExtension() {
        log.step('Installing extension to VSCode...');
        
        try {
            // Remove existing extension
            if (await this.pathExists(this.vscodeExtensionsPath)) {
                await fs.rm(this.vscodeExtensionsPath, { recursive: true, force: true });
                log.info('Removed existing extension');
            }

            // Create extension directory
            await fs.mkdir(this.vscodeExtensionsPath, { recursive: true });

            // Copy required files
            const filesToCopy = [
                { src: 'package-extension.json', dest: 'package.json' },
                { src: 'out', dest: 'out' }
            ];

            for (const file of filesToCopy) {
                const srcPath = path.join(this.projectPath, file.src);
                const destPath = path.join(this.vscodeExtensionsPath, file.dest);
                
                if (await this.pathExists(srcPath)) {
                    await this.copyRecursive(srcPath, destPath);
                    log.success(`Copied: ${file.src} → ${file.dest}`);
                }
            }

            log.success('Extension files copied to VSCode extensions directory');
        } catch (error) {
            throw new Error(`Extension installation failed: ${error.message}`);
        }
    }

    async verifyInstallation() {
        log.step('Verifying installation...');
        
        const packageJsonPath = path.join(this.vscodeExtensionsPath, 'package.json');
        const extensionJsPath = path.join(this.vscodeExtensionsPath, 'out', 'extension.js');

        try {
            await fs.access(packageJsonPath);
            await fs.access(extensionJsPath);
            
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
            log.success(`Extension installed: ${packageJson.displayName} v${packageJson.version}`);
        } catch (error) {
            throw new Error('Extension verification failed - files missing');
        }
    }

    async pathExists(path) {
        try {
            await fs.access(path);
            return true;
        } catch {
            return false;
        }
    }

    async copyRecursive(src, dest) {
        const stat = await fs.stat(src);
        
        if (stat.isDirectory()) {
            await fs.mkdir(dest, { recursive: true });
            const files = await fs.readdir(src);
            
            for (const file of files) {
                await this.copyRecursive(
                    path.join(src, file),
                    path.join(dest, file)
                );
            }
        } else {
            await fs.mkdir(path.dirname(dest), { recursive: true });
            await fs.copyFile(src, dest);
        }
    }

    async execCommand(command) {
        return new Promise((resolve, reject) => {
            const [cmd, ...args] = command.split(' ');
            const process = spawn(cmd, args, { stdio: 'pipe' });
            
            let stdout = '';
            let stderr = '';
            
            process.stdout?.on('data', (data) => {
                stdout += data.toString();
            });
            
            process.stderr?.on('data', (data) => {
                stderr += data.toString();
            });
            
            process.on('close', (code) => {
                if (code === 0) {
                    resolve(stdout);
                } else {
                    reject(new Error(stderr || `Command failed with code ${code}`));
                }
            });
        });
    }

    printNextSteps() {
        console.log('');
        log.info('📋 Next Steps:');
        console.log('');
        console.log('1. 🔄 Restart VSCode to load the extension');
        console.log('2. 🔍 Verify extension is loaded: Extensions → Search "Claude MCP"');
        console.log('3. 🚀 Activate Bridge: Ctrl+Shift+P → "Start Claude MCP Bridge"');
        console.log('4. ✅ Check status bar for "🤖 Claude MCP: Online"');
        console.log('5. 🧪 Test connection: npm run test:bridge');
        console.log('');
        log.success('Extension ready! You can now use Claude Desktop to control VSCode.');
    }
}

// CLI interface
async function main() {
    try {
        const installer = new ExtensionInstaller();
        await installer.install();
    } catch (error) {
        console.error(`❌ Installation failed: ${error.message}`);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default ExtensionInstaller;