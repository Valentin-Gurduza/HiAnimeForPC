#!/usr/bin/env node

// Simple test script to validate the application setup
const fs = require('fs');
const path = require('path');

console.log('🚀 HiAnime For PC - Setup Validation');
console.log('=====================================\n');

const requiredFiles = [
    'package.json',
    'src/main.js',
    'src/preload.js',
    'src/renderer/index.html',
    'src/renderer/js/app.js',
    'src/renderer/js/api.js',
    'src/renderer/js/ui.js',
    'src/renderer/js/player.js',
    'src/renderer/js/storage.js',
    'src/renderer/js/settings.js',
    'src/renderer/css/styles.css',
    'src/renderer/css/themes.css',
    'src/renderer/css/components.css'
];

const optionalFiles = [
    'assets/icon.svg',
    'assets/logo.png',
    'LICENSE.txt',
    'README.md',
    'DEVELOPMENT.md'
];

let allGood = true;

// Check required files
console.log('📋 Checking required files...');
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING!`);
        allGood = false;
    }
});

console.log('\n📄 Checking optional files...');
optionalFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`⚠️  ${file} - Optional, but recommended`);
    }
});

// Check node_modules
console.log('\n📦 Checking dependencies...');
if (fs.existsSync('node_modules')) {
    console.log('✅ node_modules directory exists');
    
    const criticalDeps = ['electron', 'electron-builder'];
    criticalDeps.forEach(dep => {
        if (fs.existsSync(path.join('node_modules', dep))) {
            console.log(`✅ ${dep} installed`);
        } else {
            console.log(`❌ ${dep} - NOT INSTALLED!`);
            allGood = false;
        }
    });
} else {
    console.log('❌ node_modules - Run "npm install" first!');
    allGood = false;
}

// Check package.json structure
console.log('\n⚙️  Checking package.json configuration...');
try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (pkg.main) {
        console.log(`✅ Main entry point: ${pkg.main}`);
    } else {
        console.log('❌ No main entry point defined');
        allGood = false;
    }
    
    if (pkg.scripts && pkg.scripts.start) {
        console.log('✅ Start script defined');
    } else {
        console.log('❌ No start script defined');
        allGood = false;
    }
    
    if (pkg.build) {
        console.log('✅ Electron builder configuration found');
    } else {
        console.log('⚠️  No electron builder configuration');
    }
} catch (err) {
    console.log('❌ Error reading package.json:', err.message);
    allGood = false;
}

console.log('\n🎯 Summary');
console.log('==========');

if (allGood) {
    console.log('🎉 All checks passed! Your HiAnime For PC setup looks good.');
    console.log('\n📋 Next steps:');
    console.log('1. Run "npm run dev" to start development');
    console.log('2. Run "npm run build-win" to create installer');
    console.log('3. Check DEVELOPMENT.md for detailed instructions');
} else {
    console.log('🚨 Some issues were found. Please fix them before proceeding.');
    console.log('\n🔧 Common fixes:');
    console.log('1. Run "npm install" to install dependencies');
    console.log('2. Check if all files are in the correct locations');
    console.log('3. Verify package.json configuration');
}

console.log('\n💡 For help, check:');
console.log('- README.md for general information');
console.log('- DEVELOPMENT.md for development guide');
console.log('- GitHub issues for community support');

process.exit(allGood ? 0 : 1);
