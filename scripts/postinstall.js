#!/usr/bin/env node

/**
 * 🔧 Claude VSCode Controller - Post-Install Script
 * 
 * Automatically runs after npm install to:
 * - Welcome new users
 * - Provide setup guidance  
 * - Check system requirements
 * - Offer quick setup options
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

const log = {
    info: (msg) => console.log(`${colors.blue}💡 ${msg}${colors.reset}`),
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    header: (msg) => console.log(`${colors.bright}${colors.cyan}${msg}${colors.reset}`),
    step: (msg) => console.log(`${colors.magenta}🔹 ${msg}${colors.reset}`)
};

function printWelcome() {
    console.clear();
    console.log(`
${colors.bright}${colors.cyan}╔══════════════════════════════════════════════════════════════╗
║              🤖 Claude VSCode Controller                     ║
║                    Welcome & Setup                          ║
║                                                              ║
║        Transform your coding workflow with Claude!          ║
╚══════════════════════════════════════════════════════════════╝${colors.reset}
`);
}

async function checkSystemRequirements() {
    log.step('Checking system requirements...');
    
    const issues = [];
    
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion >= 18) {
        log.success(`Node.js ${nodeVersion} ✓`);
    } else {
        issues.push('Node.js version too old (requires 18+)');
        log.error(`Node.js ${nodeVersion} (requires 18+)`);
    }
    
    // Check for VSCode
    try {
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        await execAsync('code --version');
        log.success('VSCode is installed ✓');
    } catch (error) {
        issues.push('VSCode not found in PATH');
        log.warning('VSCode not found in PATH');
    }
    
    // Check platform
    const platform = os.platform();
    if (['win32', 'darwin', 'linux'].includes(platform)) {
        log.success(`Platform ${platform} supported ✓`);
    } else {
        issues.push(`Unsupported platform: ${platform}`);
        log.error(`Unsupported platform: ${platform}`);
    }
    
    return issues;
}

async function checkExistingFiles() {
    log.step('Checking project structure...');
    
    const requiredFiles = [
        'enhanced-mcp-server.js',
        'tsconfig.json',
        'src/extension.ts'
    ];
    
    for (const file of requiredFiles) {
        try {
            await fs.access(file);
            log.success(`Found: ${file}`);
        } catch (error) {
            log.warning(`Missing: ${file}`);
        }
    }
}

function printQuickStart() {
    console.log('\n');
    log.header('🚀 QUICK START');
    console.log('');
    
    console.log(`${colors.bright}Option 1: Automated Setup (Recommended)${colors.reset}`);
    console.log(`${colors.green}npm run setup${colors.reset}                 # Complete installation`);
    console.log('');
    
    console.log(`${colors.bright}Option 2: Step by Step${colors.reset}`);
    console.log(`${colors.yellow}npm run build${colors.reset}                # Build the extension`);
    console.log(`${colors.yellow}npm run install-extension${colors.reset}    # Install VSCode extension`);
    console.log(`${colors.yellow}npm run configure-claude${colors.reset}     # Configure Claude Desktop`);
    console.log(`${colors.yellow}npm start${colors.reset}                    # Start MCP server`);
    console.log('');
    
    console.log(`${colors.bright}Option 3: Development Setup${colors.reset}`);
    console.log(`${colors.blue}npm run setup:dev${colors.reset}            # Development installation`);
    console.log(`${colors.blue}npm run debug${colors.reset}                # Start with debug logging`);
    console.log('');
}

function printUsageExamples() {
    log.header('💬 USAGE EXAMPLES');
    console.log('');
    console.log('Once installed, you can control VSCode from Claude Desktop:');
    console.log('');
    console.log(`${colors.green}"Create a new file called hello.js"${colors.reset}`);
    console.log(`${colors.green}"Open the package.json file"${colors.reset}`);
    console.log(`${colors.green}"Show me all open tabs"${colors.reset}`);
    console.log(`${colors.green}"Replace all 'var' with 'const' in this file"${colors.reset}`);
    console.log(`${colors.green}"Install the Prettier extension"${colors.reset}`);
    console.log(`${colors.green}"Change theme to Dark+"${colors.reset}`);
    console.log('');
}

function printTroubleshooting() {
    log.header('🛟 TROUBLESHOOTING');
    console.log('');
    
    console.log(`${colors.bright}Common Commands:${colors.reset}`);
    console.log(`${colors.cyan}npm run doctor${colors.reset}               # System diagnostics`);
    console.log(`${colors.cyan}npm run test:bridge${colors.reset}          # Test VSCode connection`);
    console.log(`${colors.cyan}npm run reset${colors.reset}                # Clean reinstall`);
    console.log('');
    
    console.log(`${colors.bright}Need Help?${colors.reset}`);
    console.log('📚 README.md           - Complete documentation');
    console.log('📖 EXAMPLES.md         - Usage examples');
    console.log('🤝 CONTRIBUTING.md     - Development guide');
    console.log('🐛 GitHub Issues       - Report bugs');
    console.log('');
}

function printNextSteps() {
    log.header('📋 NEXT STEPS');
    console.log('');
    
    console.log(`${colors.bright}1. Complete Setup${colors.reset}`);
    console.log(`   ${colors.yellow}npm run setup${colors.reset}`);
    console.log('');
    
    console.log(`${colors.bright}2. Start VSCode${colors.reset}`);
    console.log(`   ${colors.yellow}code .${colors.reset}`);
    console.log('');
    
    console.log(`${colors.bright}3. Activate Bridge in VSCode${colors.reset}`);
    console.log('   • Press Ctrl+Shift+P (or Cmd+Shift+P on Mac)');
    console.log('   • Type: "Start Claude MCP Bridge"');
    console.log('   • Look for "🤖 Claude MCP: Online" in status bar');
    console.log('');
    
    console.log(`${colors.bright}4. Start MCP Server${colors.reset}`);
    console.log(`   ${colors.yellow}npm start${colors.reset}`);
    console.log('');
    
    console.log(`${colors.bright}5. Test in Claude Desktop${colors.reset}`);
    console.log('   • Restart Claude Desktop');
    console.log('   • Try: "Show me VSCode workspace info"');
    console.log('');
}

function printFooter() {
    console.log(`${colors.bright}${colors.magenta}═══════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}🎉 Thank you for installing Claude VSCode Controller!${colors.reset}`);
    console.log('');
    console.log('🌟 If this helps you, please star the project on GitHub!');
    console.log('🐛 Found a bug? Create an issue on GitHub');
    console.log('💡 Have an idea? Start a discussion on GitHub');
    console.log('');
    console.log(`${colors.bright}Happy coding! 🚀${colors.reset}`);
    console.log(`${colors.bright}${colors.magenta}═══════════════════════════════════════════════════════════════${colors.reset}`);
    console.log('');
}

async function main() {
    try {
        printWelcome();
        
        // Only run checks and guidance, don't fail
        const issues = await checkSystemRequirements();
        console.log('');
        
        await checkExistingFiles();
        console.log('');
        
        if (issues.length > 0) {
            log.warning('Some system requirements need attention:');
            issues.forEach(issue => console.log(`   • ${issue}`));
            console.log('');
        }
        
        printQuickStart();
        printUsageExamples();
        printTroubleshooting();
        printNextSteps();
        printFooter();
        
    } catch (error) {
        // Don't fail the installation if this script fails
        console.log(`${colors.yellow}⚠️  Post-install setup check failed, but installation continues.${colors.reset}`);
        console.log('Run `npm run doctor` for detailed diagnostics.');
    }
}

// Only run if this script is executed directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(() => {
        // Silent fail to not break npm install
        process.exit(0);
    });
}

export default main;
