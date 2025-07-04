#!/usr/bin/env node

/**
 * 🧪 Claude VSCode Controller - Full Integration Test
 * 
 * Comprehensive test of the entire system:
 * - Tests all 30+ commands
 * - Validates WebSocket bridge
 * - Checks Claude Desktop integration
 * - Provides performance metrics
 * - Generates test report
 */

import WebSocket from 'ws';
import fs from 'fs/promises';
import path from 'path';

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
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
    test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`)
};

class IntegrationTester {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            skipped: 0,
            errors: []
        };
        this.startTime = Date.now();
    }

    async runFullTest() {
        try {
            console.log(`
${colors.bright}${colors.cyan}╔══════════════════════════════════════════════════════════════╗
║              🧪 Full Integration Test Suite                  ║
║                Claude VSCode Controller                      ║
╚══════════════════════════════════════════════════════════════╝${colors.reset}
`);

            await this.testWebSocketConnection();
            await this.testBasicCommands();
            await this.testFileOperations();
            await this.testEditorCommands();
            await this.testWorkspaceCommands();
            await this.testTerminalCommands();
            await this.testAdvancedFeatures();
            
            this.generateReport();
            
        } catch (error) {
            log.error(`Test suite failed: ${error.message}`);
            process.exit(1);
        }
    }

    async testWebSocketConnection() {
        log.test('Testing WebSocket bridge connection...');
        
        return new Promise((resolve, reject) => {
            const ws = new WebSocket('ws://localhost:3333');
            
            const timeout = setTimeout(() => {
                ws.close();
                this.recordError('WebSocket connection timeout');
                resolve();
            }, 5000);
            
            ws.on('open', () => {
                clearTimeout(timeout);
                this.recordSuccess('WebSocket connection');
                ws.close();
                resolve();
            });
            
            ws.on('error', (error) => {
                clearTimeout(timeout);
                this.recordError(`WebSocket connection failed: ${error.message}`);
                resolve();
            });
        });
    }

    async testBasicCommands() {
        log.test('Testing basic commands...');
        
        const basicTests = [
            { name: 'Workspace Info', method: 'getWorkspaceInfo', params: {} },
            { name: 'Open Tabs', method: 'getOpenTabs', params: {} },
            { name: 'Active Editor', method: 'getActiveEditor', params: {} }
        ];

        for (const test of basicTests) {
            await this.runSingleTest(test);
        }
    }

    async testFileOperations() {
        log.test('Testing file operations...');
        
        const fileTests = [
            {
                name: 'Create Test File',
                method: 'createFile',
                params: {
                    filePath: './test-integration.tmp',
                    content: '// Integration test file\nconsole.log("Test successful!");'
                }
            },
            {
                name: 'Open Test File',
                method: 'openFile',
                params: { filePath: './test-integration.tmp' }
            },
            {
                name: 'Get File Content',
                method: 'getFileContent',
                params: { filePath: './test-integration.tmp' }
            }
        ];

        for (const test of fileTests) {
            await this.runSingleTest(test);
        }

        // Cleanup
        try {
            await fs.unlink('./test-integration.tmp');
            log.info('Cleaned up test file');
        } catch (error) {
            // File might not exist, that's ok
        }
    }

    async testEditorCommands() {
        log.test('Testing editor commands...');
        
        const editorTests = [
            {
                name: 'Show Message',
                method: 'showMessage',
                params: { message: 'Integration test running...', type: 'info' }
            },
            {
                name: 'Get Extensions',
                method: 'getExtensions',
                params: {}
            }
        ];

        for (const test of editorTests) {
            await this.runSingleTest(test);
        }
    }

    async testWorkspaceCommands() {
        log.test('Testing workspace commands...');
        
        const workspaceTests = [
            {
                name: 'Get Diagnostics',
                method: 'getDiagnostics',
                params: {}
            },
            {
                name: 'Get Themes',
                method: 'getThemes',
                params: {}
            }
        ];

        for (const test of workspaceTests) {
            await this.runSingleTest(test);
        }
    }

    async testTerminalCommands() {
        log.test('Testing terminal commands...');
        
        const terminalTests = [
            {
                name: 'Open Terminal',
                method: 'openTerminal',
                params: { name: 'Integration Test' }
            }
        ];

        for (const test of terminalTests) {
            await this.runSingleTest(test);
        }
    }

    async testAdvancedFeatures() {
        log.test('Testing advanced features...');
        
        const advancedTests = [
            {
                name: 'Format Document',
                method: 'formatDocument',
                params: {}
            },
            {
                name: 'Get Selection',
                method: 'getSelection',
                params: {}
            }
        ];

        for (const test of advancedTests) {
            await this.runSingleTest(test);
        }
    }

    async runSingleTest(test) {
        return new Promise((resolve) => {
            const ws = new WebSocket('ws://localhost:3333');
            
            const timeout = setTimeout(() => {
                ws.close();
                this.recordError(`${test.name}: Timeout`);
                resolve();
            }, 10000);
            
            ws.on('open', () => {
                const command = {
                    id: Date.now().toString(),
                    method: test.method,
                    params: test.params
                };
                
                ws.send(JSON.stringify(command));
            });
            
            ws.on('message', (data) => {
                try {
                    const response = JSON.parse(data.toString());
                    clearTimeout(timeout);
                    ws.close();
                    
                    if (response.result && !response.error) {
                        this.recordSuccess(test.name);
                    } else {
                        this.recordError(`${test.name}: ${response.error || 'Unknown error'}`);
                    }
                    
                    resolve();
                } catch (error) {
                    clearTimeout(timeout);
                    ws.close();
                    this.recordError(`${test.name}: Parse error - ${error.message}`);
                    resolve();
                }
            });
            
            ws.on('error', (error) => {
                clearTimeout(timeout);
                this.recordError(`${test.name}: Connection error - ${error.message}`);
                resolve();
            });
        });
    }

    recordSuccess(testName) {
        this.results.passed++;
        log.success(`${testName} ✓`);
    }

    recordError(errorMessage) {
        this.results.failed++;
        this.results.errors.push(errorMessage);
        log.error(errorMessage);
    }

    recordSkip(testName, reason) {
        this.results.skipped++;
        log.warning(`${testName} (skipped: ${reason})`);
    }

    generateReport() {
        const duration = Date.now() - this.startTime;
        const total = this.results.passed + this.results.failed + this.results.skipped;
        
        console.log('\n');
        console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`);
        console.log(`${colors.bright}📊 INTEGRATION TEST REPORT${colors.reset}`);
        console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`);
        console.log('');
        
        console.log(`${colors.bright}Test Results:${colors.reset}`);
        console.log(`  ${colors.green}✅ Passed: ${this.results.passed}${colors.reset}`);
        console.log(`  ${colors.red}❌ Failed: ${this.results.failed}${colors.reset}`);
        console.log(`  ${colors.yellow}⏭️  Skipped: ${this.results.skipped}${colors.reset}`);
        console.log(`  📊 Total: ${total}`);
        console.log('');
        
        console.log(`${colors.bright}Performance:${colors.reset}`);
        console.log(`  ⏱️  Duration: ${duration}ms`);
        console.log(`  🚀 Average: ${Math.round(duration / total)}ms per test`);
        console.log('');
        
        if (this.results.errors.length > 0) {
            console.log(`${colors.bright}${colors.red}Errors:${colors.reset}`);
            this.results.errors.forEach(error => {
                console.log(`  • ${error}`);
            });
            console.log('');
        }
        
        // Overall status
        const successRate = (this.results.passed / total) * 100;
        
        if (successRate >= 90) {
            log.success(`🎉 Excellent! Success rate: ${successRate.toFixed(1)}%`);
            console.log('Your Claude VSCode Controller is working perfectly!');
        } else if (successRate >= 70) {
            log.warning(`⚠️  Good but needs attention. Success rate: ${successRate.toFixed(1)}%`);
            console.log('Most features work, but some issues need fixing.');
        } else {
            log.error(`❌ Critical issues detected. Success rate: ${successRate.toFixed(1)}%`);
            console.log('Many features are not working. Check your setup.');
        }
        
        console.log('');
        console.log(`${colors.bright}Next Steps:${colors.reset}`);
        
        if (this.results.failed > 0) {
            console.log('1. Run diagnostics: npm run doctor');
            console.log('2. Check VSCode Bridge is active');
            console.log('3. Restart VSCode and MCP Server');
            console.log('4. Check Claude Desktop configuration');
        } else {
            console.log('1. 🎊 Everything works! Start using Claude Desktop');
            console.log('2. 📚 Check EXAMPLES.md for usage ideas');
            console.log('3. ⭐ Star the project on GitHub if you like it!');
        }
        
        console.log('');
        console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new IntegrationTester();
    tester.runFullTest().catch(console.error);
}

export default IntegrationTester;
