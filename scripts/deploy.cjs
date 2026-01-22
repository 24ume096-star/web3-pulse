#!/usr/bin/env node

/**
 * Deployment Script for Vercel
 * 
 * This script:
 * 1. Builds the project
 * 2. Deploys to Vercel (production)
 * 3. Provides helpful feedback
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

function checkBuildOutput() {
  const distPath = path.join(process.cwd(), 'dist');
  const indexPath = path.join(distPath, 'index.html');
  
  if (!fs.existsSync(distPath)) {
    log('❌ Build output directory not found', colors.red);
    return false;
  }
  
  if (!fs.existsSync(indexPath)) {
    log('❌ index.html not found in dist folder', colors.red);
    return false;
  }
  
  log('✅ Build output verified', colors.green);
  return true;
}

async function checkVercelAuth() {
  try {
    execSync('vercel whoami', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  log('\n' + '='.repeat(60), colors.bright);
  log('🚀 Vercel Deployment Script', colors.bright);
  log('='.repeat(60) + '\n', colors.bright);

  // Step 1: Check prerequisites
  log('📋 Checking prerequisites...', colors.blue);
  
  if (!checkCommand('node')) {
    log('❌ Node.js is not installed', colors.red);
    process.exit(1);
  }
  log('✅ Node.js found', colors.green);

  if (!checkCommand('npm')) {
    log('❌ npm is not installed', colors.red);
    process.exit(1);
  }
  log('✅ npm found', colors.green);

  if (!checkCommand('vercel')) {
    log('⚠️  Vercel CLI not found. Installing...', colors.yellow);
    try {
      execSync('npm install -g vercel', { stdio: 'inherit' });
      log('✅ Vercel CLI installed', colors.green);
    } catch {
      log('❌ Failed to install Vercel CLI. Please install manually:', colors.red);
      log('   npm install -g vercel', colors.yellow);
      process.exit(1);
    }
  } else {
    log('✅ Vercel CLI found', colors.green);
  }

  // Step 2: Check if user is logged in to Vercel
  log('\n🔐 Checking Vercel authentication...', colors.blue);
  const isAuthenticated = checkVercelAuth();
  
  if (!isAuthenticated) {
    log('⚠️  Not logged in to Vercel', colors.yellow);
    log('\n📝 Please log in to Vercel:', colors.cyan);
    log('   Run: vercel login', colors.yellow);
    log('\nThis will open your browser for authentication.\n', colors.cyan);
    
    const answer = await promptUser('Have you logged in? (y/n): ');

    if (answer.toLowerCase() !== 'y') {
      log('\n❌ Please log in first and try again.', colors.red);
      log('   Run: vercel login', colors.yellow);
      process.exit(1);
    }

    // Verify login again
    if (!checkVercelAuth()) {
      log('\n❌ Still not authenticated. Please try logging in again.', colors.red);
      process.exit(1);
    }
  } else {
    log('✅ Authenticated with Vercel', colors.green);
  }

  // Step 3: Build the project
  log('\n🔨 Building project...', colors.blue);
  if (!runCommand('npm run build', 'Build')) {
    process.exit(1);
  }

  // Step 4: Verify build output
  log('\n✅ Build completed', colors.green);
  if (!checkBuildOutput()) {
    process.exit(1);
  }

  // Step 5: Deploy to Vercel
  log('\n🌐 Deploying to Vercel...', colors.blue);
  log('   This may take a few moments...', colors.cyan);

  const isPreview = process.argv.includes('--preview');
  const deployCommand = isPreview
    ? 'vercel --yes'
    : 'vercel --prod --yes';

  log(`\n📦 Deployment mode: ${isPreview ? 'Preview' : 'Production'}`, colors.cyan);

  if (!runCommand(deployCommand, 'Deploy')) {
    log('\n❌ Deployment failed', colors.red);
    log('\n💡 Tips:', colors.yellow);
    log('   - Make sure you are logged in: vercel login', colors.yellow);
    log('   - Check your internet connection', colors.yellow);
    log('   - Verify vercel.json configuration', colors.yellow);
    process.exit(1);
  }

  // Success!
  log('\n' + '='.repeat(60), colors.bright);
  log('✅ Deployment Successful!', colors.green);
  log('='.repeat(60) + '\n', colors.bright);
  
  log('🎉 Your app has been deployed to Vercel!', colors.green);
  log('\n📝 Next steps:', colors.cyan);
  log('   - Visit your Vercel dashboard to see the deployment', colors.yellow);
  log('   - Check environment variables if needed', colors.yellow);
  log('   - Set up custom domain (optional)', colors.yellow);
  log('\n');
}

main().catch(error => {
  log(`\n❌ Unexpected error: ${error.message}`, colors.red);
  process.exit(1);
});
