#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes the Next.js bundle to identify large packages and optimization opportunities
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BUNDLE_ANALYZER_DIR = '.next/analyze';
const MAX_CHUNK_SIZE = 200 * 1024; // 200KB
const MAX_ENTRYPOINT_SIZE = 400 * 1024; // 400KB

console.log('🔍 Analyzing Next.js bundle...\n');

// Check if bundle analyzer output exists
if (!fs.existsSync(BUNDLE_ANALYZER_DIR)) {
  console.log('❌ Bundle analyzer output not found.');
  console.log('💡 Run: ANALYZE=true pnpm build');
  process.exit(1);
}

// Read bundle analyzer files
const clientStats = JSON.parse(
  fs.readFileSync(path.join(BUNDLE_ANALYZER_DIR, 'client.json'), 'utf8')
);

const serverStats = JSON.parse(
  fs.readFileSync(path.join(BUNDLE_ANALYZER_DIR, 'server.json'), 'utf8')
);

console.log('📊 Bundle Analysis Results\n');

// Analyze client bundle
console.log('🌐 Client Bundle:');
analyzeBundle(clientStats, 'client');

console.log('\n🖥️  Server Bundle:');
analyzeBundle(serverStats, 'server');

// Generate recommendations
console.log('\n💡 Optimization Recommendations:');
generateRecommendations(clientStats, serverStats);

function analyzeBundle(stats, type) {
  const { chunks, entrypoints } = stats;
  
  // Analyze chunks
  const largeChunks = chunks.filter(chunk => chunk.size > MAX_CHUNK_SIZE);
  const totalChunkSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
  
  console.log(`  📦 Total chunks: ${chunks.length}`);
  console.log(`  📏 Total size: ${formatBytes(totalChunkSize)}`);
  console.log(`  ⚠️  Large chunks (>${formatBytes(MAX_CHUNK_SIZE)}): ${largeChunks.length}`);
  
  if (largeChunks.length > 0) {
    console.log('    Large chunks:');
    largeChunks.forEach(chunk => {
      console.log(`      - ${chunk.name}: ${formatBytes(chunk.size)}`);
    });
  }
  
  // Analyze entrypoints
  const largeEntrypoints = Object.entries(entrypoints).filter(([name, entrypoint]) => {
    const totalSize = entrypoint.chunks.reduce((sum, chunkId) => {
      const chunk = chunks.find(c => c.id === chunkId);
      return sum + (chunk ? chunk.size : 0);
    }, 0);
    return totalSize > MAX_ENTRYPOINT_SIZE;
  });
  
  console.log(`  🚪 Entrypoints: ${Object.keys(entrypoints).length}`);
  console.log(`  ⚠️  Large entrypoints (>${formatBytes(MAX_ENTRYPOINT_SIZE)}): ${largeEntrypoints.length}`);
  
  if (largeEntrypoints.length > 0) {
    console.log('    Large entrypoints:');
    largeEntrypoints.forEach(([name, entrypoint]) => {
      const totalSize = entrypoint.chunks.reduce((sum, chunkId) => {
        const chunk = chunks.find(c => c.id === chunkId);
        return sum + (chunk ? chunk.size : 0);
      }, 0);
      console.log(`      - ${name}: ${formatBytes(totalSize)}`);
    });
  }
}

function generateRecommendations(clientStats, serverStats) {
  const recommendations = [];
  
  // Check for large chunks
  const largeClientChunks = clientStats.chunks.filter(chunk => chunk.size > MAX_CHUNK_SIZE);
  if (largeClientChunks.length > 0) {
    recommendations.push('🔧 Reduce chunk sizes by implementing more aggressive code splitting');
    recommendations.push('📦 Use dynamic imports for heavy components');
    recommendations.push('🎯 Implement route-based code splitting');
  }
  
  // Check for large entrypoints
  const largeEntrypoints = Object.entries(clientStats.entrypoints).filter(([name, entrypoint]) => {
    const totalSize = entrypoint.chunks.reduce((sum, chunkId) => {
      const chunk = clientStats.chunks.find(c => c.id === chunkId);
      return sum + (chunk ? chunk.size : 0);
    }, 0);
    return totalSize > MAX_ENTRYPOINT_SIZE;
  });
  
  if (largeEntrypoints.length > 0) {
    recommendations.push('🚪 Optimize entrypoint sizes by lazy loading non-critical code');
    recommendations.push('⚡ Implement critical CSS inlining');
    recommendations.push('🔄 Use webpack bundle analyzer to identify large dependencies');
  }
  
  // Check for vendor chunks
  const vendorChunks = clientStats.chunks.filter(chunk => 
    chunk.name && chunk.name.includes('vendors')
  );
  
  if (vendorChunks.length > 0) {
    recommendations.push('📚 Split vendor chunks by package type (React, UI libraries, etc.)');
    recommendations.push('🎨 Separate UI component libraries into their own chunks');
    recommendations.push('🔧 Use tree shaking to remove unused code');
  }
  
  // General recommendations
  recommendations.push('📱 Implement progressive loading for mobile devices');
  recommendations.push('🎯 Use Next.js Image component for optimized images');
  recommendations.push('⚡ Enable compression and minification');
  
  recommendations.forEach(rec => console.log(`  ${rec}`));
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Check for specific optimization opportunities
console.log('\n🔍 Specific Issues Found:');

// Check for large dependencies
const checkLargeDependencies = () => {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const largePackages = [
    '@supabase/supabase-js',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    'lucide-react',
    'react-icons'
  ];
  
  largePackages.forEach(pkg => {
    if (dependencies[pkg]) {
      console.log(`  ⚠️  Large package detected: ${pkg}`);
      console.log(`     Consider lazy loading or code splitting`);
    }
  });
};

checkLargeDependencies();

console.log('\n✅ Bundle analysis complete!');
console.log('💡 Use the recommendations above to optimize your bundle size.');
