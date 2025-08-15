#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔍 Analyzing bundle sizes...\n')

try {
  // Build the project first
  console.log('📦 Building project...')
  execSync('pnpm build', { stdio: 'inherit' })
  
  // Check if bundle analyzer is available
  const bundleAnalyzerPath = path.join(process.cwd(), '.next/analyze')
  
  if (fs.existsSync(bundleAnalyzerPath)) {
    console.log('📊 Bundle analysis available at:', bundleAnalyzerPath)
  }
  
  // Analyze bundle sizes
  console.log('\n📏 Bundle size analysis:')
  
  const nextDir = path.join(process.cwd(), '.next')
  const staticDir = path.join(nextDir, 'static')
  
  if (fs.existsSync(staticDir)) {
    const chunksDir = path.join(staticDir, 'chunks')
    
    if (fs.existsSync(chunksDir)) {
      const files = fs.readdirSync(chunksDir)
      
      // Group files by type and calculate totals
      const jsFiles = []
      const cssFiles = []
      let totalJS = 0
      let totalCSS = 0
      
      files.forEach(file => {
        if (file.endsWith('.js')) {
          const filePath = path.join(chunksDir, file)
          const stats = fs.statSync(filePath)
          const sizeKB = Math.round(stats.size / 1024)
          const sizeMB = (stats.size / (1024 * 1024)).toFixed(2)
          
          jsFiles.push({ name: file, size: stats.size, sizeKB, sizeMB })
          totalJS += stats.size
        }
      })
      
      // Sort by size (largest first)
      jsFiles.sort((a, b) => b.size - a.size)
      
      jsFiles.forEach(file => {
        let status = '✅'
        if (file.sizeKB > 500) {
          status = '⚠️'
        } else if (file.sizeKB > 250) {
          status = '🔶'
        }
        
        console.log(`${status} ${file.name}: ${file.sizeKB}KB (${file.sizeMB}MB)`)
      })
      
      console.log(`\n📊 JavaScript Total: ${Math.round(totalJS / 1024)}KB (${(totalJS / (1024 * 1024)).toFixed(2)}MB)`)
    }
    
    // Check CSS files
    const cssDir = path.join(staticDir, 'css')
    if (fs.existsSync(cssDir)) {
      console.log('\n🎨 CSS files:')
      const cssFiles = fs.readdirSync(cssDir)
      
      cssFiles.forEach(file => {
        if (file.endsWith('.css')) {
          const filePath = path.join(cssDir, file)
          const stats = fs.statSync(filePath)
          const sizeKB = Math.round(stats.size / 1024)
          
          let status = '✅'
          if (sizeKB > 100) {
            status = '⚠️'
          }
          
          console.log(`${status} ${file}: ${sizeKB}KB`)
          totalCSS += stats.size
        }
      })
      
      console.log(`\n📊 CSS Total: ${Math.round(totalCSS / 1024)}KB (${(totalCSS / (1024 * 1024)).toFixed(2)}MB)`)
    }
    
    // Overall bundle analysis
    const totalBundle = totalJS + totalCSS
    console.log(`\n🎯 Overall Bundle: ${Math.round(totalBundle / 1024)}KB (${(totalBundle / (1024 * 1024)).toFixed(2)}MB)`)
    
    // Performance score calculation
    let performanceScore = 100
    if (totalBundle > 2 * 1024 * 1024) { // > 2MB
      performanceScore = 60
    } else if (totalBundle > 1.5 * 1024 * 1024) { // > 1.5MB
      performanceScore = 70
    } else if (totalBundle > 1024 * 1024) { // > 1MB
      performanceScore = 80
    } else if (totalBundle > 500 * 1024) { // > 500KB
      performanceScore = 90
    }
    
    console.log(`\n🏆 Estimated Performance Score: ${performanceScore}/100`)
  }
  
  // Performance recommendations
  console.log('\n💡 Performance recommendations:')
  console.log('• Keep individual chunks under 250KB')
  console.log('• Keep entry points under 500KB')
  console.log('• Use dynamic imports for large components')
  console.log('• Optimize images and use WebP/AVIF formats')
  console.log('• Implement proper code splitting')
  
  // Check for large dependencies
  console.log('\n📋 Large dependencies to consider:')
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }
  
  Object.entries(dependencies).forEach(([name, version]) => {
    if (name.includes('@radix-ui') || name.includes('lucide') || name.includes('react-icons')) {
      console.log(`• ${name}@${version} - Consider tree-shaking`)
    }
  })
  
  // Bundle optimization suggestions
  console.log('\n🚀 Bundle optimization suggestions:')
  
  if (totalJS > 1024 * 1024) { // > 1MB JS
    console.log('• Consider splitting large JavaScript bundles')
    console.log('• Use dynamic imports for non-critical components')
    console.log('• Implement route-based code splitting')
  }
  
  if (totalCSS > 200 * 1024) { // > 200KB CSS
    console.log('• Consider CSS-in-JS for component-specific styles')
    console.log('• Implement CSS purging to remove unused styles')
    console.log('• Use CSS modules to prevent style conflicts')
  }
  
  // Next steps
  console.log('\n📋 Next steps:')
  console.log('1. Run "pnpm analyze" for detailed bundle analysis')
  console.log('2. Use "pnpm lighthouse" for performance audit')
  console.log('3. Monitor Core Web Vitals in production')
  console.log('4. Set up bundle size alerts in CI/CD')
  
} catch (error) {
  console.error('❌ Error analyzing bundle:', error.message)
  process.exit(1)
}
