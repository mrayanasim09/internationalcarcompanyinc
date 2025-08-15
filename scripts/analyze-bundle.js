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
      
      files.forEach(file => {
        if (file.endsWith('.js')) {
          const filePath = path.join(chunksDir, file)
          const stats = fs.statSync(filePath)
          const sizeKB = Math.round(stats.size / 1024)
          const sizeMB = (stats.size / (1024 * 1024)).toFixed(2)
          
          let status = '✅'
          if (sizeKB > 500) {
            status = '⚠️'
          } else if (sizeKB > 250) {
            status = '🔶'
          }
          
          console.log(`${status} ${file}: ${sizeKB}KB (${sizeMB}MB)`)
        }
      })
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
        }
      })
    }
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
  
} catch (error) {
  console.error('❌ Error analyzing bundle:', error.message)
  process.exit(1)
}
