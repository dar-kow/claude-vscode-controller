#!/usr/bin/env node

/**
 * 🧪 Claude VSCode Controller - Quick Bridge Test
 * 
 * Tests WebSocket connection to VSCode Bridge and basic functionality
 */

import WebSocket from 'ws';

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
    test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`)
};

class BridgeTest {
    constructor() {
        this.ws = null;
        this.tests = [];
        this.results = { passed: 0, failed: 0 };
    }

    async runTests() {
        console.log('🧪 Claude VSCode Controller - Bridge Connection Test\n');
        
        try {
            await this.connectToBridge();
            await this.runTestSuite();
            this.printResults();
        } catch (error) {
            log.error(`Test suite failed: ${error.message}`);
            process.exit(1);
        } finally {
            if (this.ws) {
                this.ws.close();
            }
        }
    }

    async connectToBridge() {
        log.test('Testing WebSocket connection to VSCode Bridge...');
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout - is VSCode Bridge running?'));
            }, 5000);

            this.ws = new WebSocket('ws://localhost:3333');
            
            this.ws.on('open', () => {
                clearTimeout(timeout);
                log.success('Connected to VSCode Bridge on port 3333');
                resolve();
            });
            
            this.ws.on('error', (error) => {
                clearTimeout(timeout);
                reject(new Error(`Connection failed: ${error.message}`));
            });
        });
    }

    async sendCommand(method, params = {}) {
        return new Promise((resolve, reject) => {
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                reject(new Error('WebSocket not connected'));
                return;
            }

            const id = Date.now().toString();
            const command = { id, method, params };

            const timeout = setTimeout(() => {
                reject(new Error('Command timeout'));
            }, 5000);

            const handleMessage = (data) => {
                try {
                    const response = JSON.parse(data.toString());
                    if (response.id === id) {
                        clearTimeout(timeout);
                        this.ws.off('message', handleMessage);
                        resolve(response.result);
                    }
                } catch (error) {
                    reject(error);
                }
            };

            this.ws.on('message', handleMessage);
            this.ws.send(JSON.stringify(command));
        });
    }

    async runTestSuite() {
        const tests = [
            {
                name: 'Get Workspace Info',
                method: 'getWorkspaceInfo',
                validate: (result) => result && result.hasWorkspace !== undefined
            },
            {
                name: 'Get Open Tabs',
                method: 'getOpenTabs',
                validate: (result) => Array.isArray(result)
            },
            {
                name: 'Get Active Editor',
                method: 'getActiveEditor',
                validate: (result) => result !== undefined
            },
            {
                name: 'Show Message',
                method: 'showMessage',
                params: { message: 'Bridge test successful!', type: 'info' },
                validate: (result) => result && result.success
            }
        ];

        log.test(`Running ${tests.length} bridge tests...\n`);

        for (const test of tests) {
            await this.runSingleTest(test);
        }
    }

    async runSingleTest(test) {
        try {
            log.test(`Testing: ${test.name}`);
            
            const result = await this.sendCommand(test.method, test.params);
            
            if (test.validate(result)) {
                log.success(`✓ ${test.name} - PASSED`);
                this.results.passed++;
            } else {
                log.error(`✗ ${test.name} - FAILED (invalid result)`);
                this.results.failed++;
            }
        } catch (error) {
            log.error(`✗ ${test.name} - FAILED (${error.message})`);
            this.results.failed++;
        }
    }

    printResults() {
        console.log('\n' + '='.repeat(50));
        console.log('🧪 TEST RESULTS');
        console.log('='.repeat(50));
        
        log.success(`Passed: ${this.results.passed}`);
        if (this.results.failed > 0) {
            log.error(`Failed: ${this.results.failed}`);
        } else {
            log.success(`Failed: ${this.results.failed}`);
        }
        
        const total = this.results.passed + this.results.failed;
        const percentage = total > 0 ? Math.round((this.results.passed / total) * 100) : 0;
        
        console.log(`\nSuccess Rate: ${percentage}%`);
        
        if (this.results.failed === 0) {
            log.success('\n🎉 All tests passed! VSCode Bridge is working correctly.');
            console.log('\n💡 You can now use Claude Desktop to control VSCode!');
        } else {
            log.warning('\n⚠️  Some tests failed. Check VSCode Bridge status.');
            console.log('\n💡 Troubleshooting:');
            console.log('   1. Make sure VSCode is running');
            console.log('   2. Activate Bridge: Ctrl+Shift+P → "Start Claude MCP Bridge"');
            console.log('   3. Check status bar for "🤖 Claude MCP: Online"');
        }
    }
}

// Run tests
const test = new BridgeTest();
test.runTests().catch(console.error);