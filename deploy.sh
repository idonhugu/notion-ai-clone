#!/bin/bash
cd "$(dirname "$0")"
export PATH="$HOME/.local/node/bin:$PATH"

echo "=========================================="
echo "  🚀 Notion AI Clone - One-Click Deploy"
echo "=========================================="
echo ""
echo "Logging in and deploying to Vercel..."
vercel
