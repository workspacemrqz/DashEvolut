#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting production build...');

// Definir NODE_ENV como production
process.env.NODE_ENV = 'production';

try {
  // Limpar diretório dist se existir
  if (fs.existsSync('dist')) {
    console.log('🧹 Cleaning dist directory...');
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Build do cliente (frontend)
  console.log('🎨 Building client...');
  execSync('cross-env NODE_ENV=production vite build', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Build do servidor (backend)
  console.log('⚙️ Building server...');
  execSync('cross-env NODE_ENV=production esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  console.log('✅ Build completed successfully!');
  
  // Verificar se os arquivos foram criados
  const requiredFiles = [
    'dist/index.js',
    'dist/public/index.html'
  ];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Required file not found: ${file}`);
    }
  }
  
  console.log('✅ All required files are present');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}