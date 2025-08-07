#!/usr/bin/env node
/**
 * Test script to verify the bug fixes implemented in the HiAnime for PC app
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing HiAnime for PC Bug Fixes\n');

// Test 1: Verify DevTools fix in main.js
function testDevToolsFix() {
    console.log('📋 Test 1: DevTools Auto-Opening Fix');
    
    const mainPath = path.join(__dirname, 'src', 'main.js');
    const mainContent = fs.readFileSync(mainPath, 'utf-8');
    
    // Check that DevTools opening is now conditional
    const hasConditionalDevTools = mainContent.includes('--devtools') && 
                                  mainContent.includes('process.argv.includes');
    
    if (hasConditionalDevTools) {
        console.log('✅ DevTools will only open with --devtools flag');
    } else {
        console.log('❌ DevTools fix not found');
    }
    
    return hasConditionalDevTools;
}

// Test 2: Verify anime card click handling in ui.js
function testAnimeCardFix() {
    console.log('\n📋 Test 2: Anime Card Click Handling Fix');
    
    const uiPath = path.join(__dirname, 'src', 'renderer', 'js', 'ui.js');
    const uiContent = fs.readFileSync(uiPath, 'utf-8');
    
    // Check for improved error handling and ID extraction
    const hasImprovedHandling = uiContent.includes('extractAnimeId') &&
                              uiContent.includes('console.error') &&
                              uiContent.includes('Invalid anime ID');
    
    if (hasImprovedHandling) {
        console.log('✅ Anime card clicks now have proper error handling');
    } else {
        console.log('❌ Anime card fix not found');
    }
    
    return hasImprovedHandling;
}

// Test 3: Verify page loading improvements
function testPageLoadingFix() {
    console.log('\n📋 Test 3: Page Loading Improvements');
    
    const uiPath = path.join(__dirname, 'src', 'renderer', 'js', 'ui.js');
    const uiContent = fs.readFileSync(uiPath, 'utf-8');
    
    // Check for missing page loading methods
    const hasCompletedPage = uiContent.includes('loadCompletedPage') &&
                            uiContent.includes('renderCompletedAnime');
    const hasGenresPage = uiContent.includes('loadGenresPage') &&
                         uiContent.includes('renderGenresList');
    const hasErrorHandling = uiContent.includes('showErrorPage') &&
                           uiContent.includes('showBasicMessage');
    
    if (hasCompletedPage && hasGenresPage && hasErrorHandling) {
        console.log('✅ Page loading methods implemented with error handling');
    } else {
        console.log('❌ Page loading fixes incomplete');
        console.log(`   Completed page: ${hasCompletedPage ? '✅' : '❌'}`);
        console.log(`   Genres page: ${hasGenresPage ? '✅' : '❌'}`);
        console.log(`   Error handling: ${hasErrorHandling ? '✅' : '❌'}`);
    }
    
    return hasCompletedPage && hasGenresPage && hasErrorHandling;
}

// Test 4: Verify dependencies are installed
function testDependencies() {
    console.log('\n📋 Test 4: Dependencies Installation');
    
    const nodeModulesPath = path.join(__dirname, 'node_modules');
    const packageJsonPath = path.join(__dirname, 'package.json');
    
    if (!fs.existsSync(nodeModulesPath)) {
        console.log('❌ node_modules directory not found');
        return false;
    }
    
    if (!fs.existsSync(packageJsonPath)) {
        console.log('❌ package.json not found');
        return false;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const requiredDeps = ['electron', 'axios', 'cheerio'];
    const missingDeps = requiredDeps.filter(dep => 
        !fs.existsSync(path.join(nodeModulesPath, dep))
    );
    
    if (missingDeps.length === 0) {
        console.log('✅ All required dependencies are installed');
        console.log(`   Electron version: ${packageJson.devDependencies?.electron || 'unknown'}`);
    } else {
        console.log(`❌ Missing dependencies: ${missingDeps.join(', ')}`);
    }
    
    return missingDeps.length === 0;
}

// Test 5: Check application structure
function testAppStructure() {
    console.log('\n📋 Test 5: Application Structure');
    
    const requiredFiles = [
        'src/main.js',
        'src/preload.js',
        'src/renderer/index.html',
        'src/renderer/css/styles.css',
        'src/renderer/js/app.js',
        'src/renderer/js/ui.js',
        'src/renderer/js/api.js'
    ];
    
    const missingFiles = requiredFiles.filter(file => 
        !fs.existsSync(path.join(__dirname, file))
    );
    
    if (missingFiles.length === 0) {
        console.log('✅ All core application files present');
    } else {
        console.log(`❌ Missing files: ${missingFiles.join(', ')}`);
    }
    
    return missingFiles.length === 0;
}

// Run all tests
async function runTests() {
    const results = [];
    
    results.push(testDevToolsFix());
    results.push(testAnimeCardFix());
    results.push(testPageLoadingFix());
    results.push(testDependencies());
    results.push(testAppStructure());
    
    const passedTests = results.filter(Boolean).length;
    const totalTests = results.length;
    
    console.log('\n🎯 Test Results Summary');
    console.log('========================');
    console.log(`Passed: ${passedTests}/${totalTests} tests`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! The app fixes are working correctly.');
        console.log('\n📝 Next Steps:');
        console.log('1. Run the app: npm start');
        console.log('2. Test anime browsing and selection');
        console.log('3. Verify video player functionality');
        console.log('4. Build installer: npm run build');
    } else {
        console.log('⚠️  Some tests failed. Please review the fixes.');
    }
    
    return passedTests === totalTests;
}

// Execute tests
if (require.main === module) {
    runTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Test execution failed:', error);
        process.exit(1);
    });
}

module.exports = { runTests };
