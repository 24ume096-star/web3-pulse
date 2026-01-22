#!/usr/bin/env node

/**
 * Backend API Deployment Script for Vercel
 * 
 * Deploys the backend API as a separate Vercel project
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkCommand(command) {
  try {
    if (process.platform === 'win32') {
      execSync(`where ${command}`, { stdio: 'ignore' });
    } else {
      execSync(`which ${command}`, { stdio: 'ignore' });
    }
    return true;
  } catch {
    try {
      execSync(`${command} --version`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
}

function runCommand(command, description) {
  log(`\n${description}...`, colors.cyan);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`\n❌ Error: ${description} failed`, colors.red);
    return false;
  }
}

async function main() {
  log('\n' + '='.repeat(60), colors.bright);
  log('🚀 Backend API Deployment to Vercel', colors.bright);
  log('='.repeat(60) + '\n', colors.bright);

  // Step 1: Check prerequisites
  log('📋 Checking prerequisites...', colors.blue);
  
  if (!checkCommand('vercel')) {
    log('❌ Vercel CLI not found', colors.red);
    log('   Please install: npm install -g vercel', colors.yellow);
    process.exit(1);
  }
  log('✅ Vercel CLI found', colors.green);

  // Step 2: Verify api/index.js exists
  const apiIndexPath = path.join(process.cwd(), 'api', 'index.js');
  if (!fs.existsSync(apiIndexPath)) {
    log('❌ api/index.js not found', colors.red);
    log('   Creating api/index.js...', colors.yellow);
    
    const apiDir = path.join(process.cwd(), 'api');
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir);
    }
    
    fs.writeFileSync(apiIndexPath, `const { app } = require('../backend/api/server.cjs');
module.exports = app;`);
    log('✅ Created api/index.js', colors.green);
  } else {
    log('✅ api/index.js found', colors.green);
  }

  // Step 3: Create vercel.json for backend if needed
  const backendVercelJson = {
    "version": 2,
    "builds": [
      {
        "src": "api/index.js",
        "use": "@vercel/node"
      }
    ],
    "routes": [
      {
        "src": "/api/(.*)",
        "dest": "api/index.js"
      }
    ]
  };

  log('\n📝 Vercel configuration:', colors.blue);
  log(JSON.stringify(backendVercelJson, null, 2), colors.cyan);

  // Step 4: Deploy
  log('\n🌐 Deploying backend API to Vercel...', colors.blue);
  log('   This will create a NEW Vercel project for the backend', colors.yellow);
  log('   Project name suggestion: monad-pulse-api\n', colors.cyan);

  const projectName = process.argv[2] || 'monad-pulse-api';
  log(`📦 Project name: ${projectName}`, colors.cyan);

  const deployCommand = process.argv.includes('--preview')
    ? `vercel --yes --name ${projectName}`
    : `vercel --prod --yes --name ${projectName}`;

  log('\n⚠️  IMPORTANT:', colors.yellow);
  log('   After deployment, Vercel will show you a URL like:', colors.yellow);
  log('   https://monad-pulse-api.vercel.app', colors.cyan);
  log('   📝 COPY THIS URL - you\'ll need it for the frontend!\n', colors.yellow);

  if (!runCommand(deployCommand, 'Deploy Backend')) {
    log('\n❌ Deployment failed', colors.red);
    log('\n💡 Tips:', colors.yellow);
    log('   - Make sure you are logged in: vercel login', colors.yellow);
    log('   - Check your internet connection', colors.yellow);
    process.exit(1);
  }

  // Success!
  log('\n' + '='.repeat(60), colors.bright);
  log('✅ Backend Deployment Successful!', colors.green);
  log('='.repeat(60) + '\n', colors.bright);
  
  log('🎉 Your backend API has been deployed!', colors.green);
  log('\n📝 Next Steps:', colors.cyan);
  log('   1. 📋 Copy the backend URL shown above', colors.yellow);
  log('   2. 🌐 Go to your FRONTEND project in Vercel dashboard', colors.yellow);
  log('   3. ⚙️  Settings → Environment Variables', colors.yellow);
  log('   4. ➕ Add: VITE_API_URL = <your-backend-url>', colors.yellow);
  log('   5. 🔄 Redeploy your frontend', colors.yellow);
  log('\n   Example:', colors.cyan);
  log('   VITE_API_URL = https://monad-pulse-api.vercel.app\n', colors.cyan);
}

main().catch(error => {
  log(`\n❌ Unexpected error: ${error.message}`, colors.red);
  process.exit(1);
});
