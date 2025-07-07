#!/bin/bash
echo "🚀 Starting Claude VSCode Controller Bridge..."
echo "📁 Project: $(pwd)"

# Check if VSCode is running
if ! pgrep -f "code" > /dev/null; then
    echo "❌ VSCode is not running!"
    echo "💡 Please start VSCode first: code ."
    read -p "Press Enter to continue..."
    exit 1
fi

# Start MCP Server
echo "🔌 Starting MCP Server..."
node enhanced-mcp-server.js
