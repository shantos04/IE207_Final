#!/bin/bash

echo "🚀 IE207 Final - Vercel Deployment Quick Start"
echo "=============================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Ready for Vercel deployment"
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Create GitHub repository at: https://github.com/new"
echo "2. Run these commands:"
echo ""
echo "   git remote add origin https://github.com/YOUR-USERNAME/IE207_Final.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Deploy Backend:"
echo "   - Go to: https://vercel.com/new"
echo "   - Import your GitHub repository"
echo "   - Root Directory: server"
echo "   - Add Environment Variables (see DEPLOY_VERCEL.md)"
echo ""
echo "4. Deploy Frontend:"
echo "   - Go to: https://vercel.com/new"
echo "   - Import your GitHub repository again"
echo "   - Root Directory: (leave empty - root)"
echo "   - Add Environment Variables (see DEPLOY_VERCEL.md)"
echo ""
echo "📖 Full documentation: DEPLOY_VERCEL.md"
echo ""
