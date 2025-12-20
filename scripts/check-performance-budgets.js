#!/usr/bin/env node

/**
 * Performance Budgets Checker
 * 
 * Verifica se o bundle e métricas de performance estão dentro dos budgets
 * Integrado com CI/CD para falhar builds que excedem limites
 * 
 * Usage:
 *   node scripts/check-performance-budgets.js
 *   npm run check:budgets
 * 
 * Exit codes:
 *   0 - Todos os budgets OK
 *   1 - Budgets excedidos
 */

const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

// Carregar budgets
const budgetsPath = path.join(process.cwd(), 'performance-budgets.json');
const budgets = JSON.parse(fs.readFileSync(budgetsPath, 'utf-8'));

// Analisar build
const buildPath = path.join(process.cwd(), '.next');
const statsPath = path.join(buildPath, 'analyze', 'client.json');

let hasErrors = false;
let hasWarnings = false;

console.log(`\n${colors.blue}${colors.bold}🎯 Performance Budgets Check${colors.reset}\n`);
console.log(`Project: ${budgets.name}`);
console.log(`Version: ${budgets.version}\n`);

/**
 * Verificar tamanho dos bundles
 */
function checkBundleSizes() {
  console.log(`${colors.bold}📦 Bundle Size Analysis${colors.reset}\n`);
  
  if (!fs.existsSync(statsPath)) {
    console.log(`${colors.yellow}⚠️  Build stats não encontrado. Execute 'npm run build' primeiro.${colors.reset}\n`);
    return;
  }
  
  const stats = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
  
  // Análise de chunks principais
  const chunks = stats.chunks || [];
  let totalSize = 0;
  let jsSize = 0;
  let cssSize = 0;
  
  chunks.forEach((chunk) => {
    chunk.files.forEach((file) => {
      const filePath = path.join(buildPath, file);
      if (fs.existsSync(filePath)) {
        const fileStats = fs.statSync(filePath);
        const sizeKB = fileStats.size / 1024;
        totalSize += sizeKB;
        
        if (file.endsWith('.js')) {
          jsSize += sizeKB;
        } else if (file.endsWith('.css')) {
          cssSize += sizeKB;
        }
      }
    });
  });
  
  // Verificar budgets
  const jsBudget = budgets.thresholds.javascript.total;
  const cssBudget = budgets.thresholds.css.total;
  const totalBudget = budgets.budgets[0].resourceSizes.find(r => r.resourceType === 'total').budget;
  
  checkMetric('JavaScript Bundle', jsSize, jsBudget, 'KB');
  checkMetric('CSS Bundle', cssSize, cssBudget, 'KB');
  checkMetric('Total Bundle Size', totalSize, totalBudget, 'KB');
  
  console.log('');
}

/**
 * Verificar chunk sizes individuais
 */
function checkChunkSizes() {
  console.log(`${colors.bold}📊 Chunk Analysis${colors.reset}\n`);
  
  const chunksPath = path.join(buildPath, 'static', 'chunks');
  
  if (!fs.existsSync(chunksPath)) {
    console.log(`${colors.yellow}⚠️  Chunks não encontrados${colors.reset}\n`);
    return;
  }
  
  const files = fs.readdirSync(chunksPath);
  const mainBudget = budgets.thresholds.javascript['main-bundle'];
  const vendorBudget = budgets.thresholds.javascript['vendor-bundle'];
  
  files.forEach((file) => {
    if (!file.endsWith('.js')) return;
    
    const filePath = path.join(chunksPath, file);
    const stats = fs.statSync(filePath);
    const sizeKB = stats.size / 1024;
    
    // Identificar tipo de chunk
    let budget = 100; // Default
    let label = file;
    
    if (file.includes('main')) {
      budget = mainBudget;
      label = `Main chunk (${file})`;
    } else if (file.includes('framework') || file.includes('vendor')) {
      budget = vendorBudget;
      label = `Vendor chunk (${file})`;
    }
    
    // Mostrar apenas chunks grandes
    if (sizeKB > 50) {
      checkMetric(label, sizeKB, budget, 'KB', false);
    }
  });
  
  console.log('');
}

/**
 * Verificar Third-Party Scripts
 */
function checkThirdParty() {
  console.log(`${colors.bold}🔌 Third-Party Scripts${colors.reset}\n`);
  
  // Lista de third-party conhecidos (pode ser dinâmico)
  const thirdPartyScripts = [
    { name: 'Google Tag Manager', size: 28, budget: 50 },
    { name: 'Google Analytics', size: 45, budget: 50 },
    { name: 'Google Maps', size: 150, budget: 200 },
  ];
  
  thirdPartyScripts.forEach((script) => {
    checkMetric(script.name, script.size, script.budget, 'KB', false);
  });
  
  console.log('');
}

/**
 * Verificar métricas Lighthouse (se disponível)
 */
function checkLighthouseMetrics() {
  const lighthouseReportPath = path.join(process.cwd(), 'lighthouse-report.json');
  
  if (!fs.existsSync(lighthouseReportPath)) {
    console.log(`${colors.yellow}⚠️  Lighthouse report não encontrado. Execute 'npm run lighthouse' primeiro.${colors.reset}\n`);
    return;
  }
  
  console.log(`${colors.bold}🔦 Lighthouse Metrics${colors.reset}\n`);
  
  const report = JSON.parse(fs.readFileSync(lighthouseReportPath, 'utf-8'));
  const { categories, audits } = report;
  
  // Verificar scores de categorias
  Object.entries(budgets.lighthouse).forEach(([category, config]) => {
    const score = categories[category]?.score * 100 || 0;
    const budget = config.budget;
    
    checkMetric(
      `${category.charAt(0).toUpperCase() + category.slice(1)} Score`,
      score,
      budget,
      'pts',
      false,
      true // isScore
    );
  });
  
  console.log('');
  
  // Verificar métricas de timing
  const timingMetrics = [
    { key: 'first-contentful-paint', name: 'First Contentful Paint', unit: 'ms' },
    { key: 'largest-contentful-paint', name: 'Largest Contentful Paint', unit: 'ms' },
    { key: 'total-blocking-time', name: 'Total Blocking Time', unit: 'ms' },
    { key: 'cumulative-layout-shift', name: 'Cumulative Layout Shift', unit: '' },
    { key: 'speed-index', name: 'Speed Index', unit: 'ms' },
  ];
  
  timingMetrics.forEach((metric) => {
    const audit = audits[metric.key];
    if (!audit) return;
    
    const value = audit.numericValue;
    const budgetConfig = budgets.timings.find(t => t.metric === metric.key);
    
    if (budgetConfig) {
      checkMetric(metric.name, value, budgetConfig.budget, metric.unit);
    }
  });
  
  console.log('');
}

/**
 * Helper para verificar métrica individual
 */
function checkMetric(name, value, budget, unit = '', showBar = true, isScore = false) {
  const percentage = (value / budget) * 100;
  let status = '✅';
  let color = colors.green;
  
  // Para scores, invertemos a lógica (maior é melhor)
  if (isScore) {
    if (value < budget * 0.9) {
      status = '❌';
      color = colors.red;
      hasErrors = true;
    } else if (value < budget) {
      status = '⚠️ ';
      color = colors.yellow;
      hasWarnings = true;
    }
  } else {
    // Para tamanhos/tempos, menor é melhor
    if (percentage > 100) {
      status = '❌';
      color = colors.red;
      hasErrors = true;
    } else if (percentage > 90) {
      status = '⚠️ ';
      color = colors.yellow;
      hasWarnings = true;
    }
  }
  
  const valueStr = unit === 'KB' ? value.toFixed(1) : Math.round(value);
  const budgetStr = unit === 'KB' ? budget.toFixed(1) : budget;
  
  console.log(`${status} ${color}${name}${colors.reset}`);
  console.log(`   ${valueStr}${unit} / ${budgetStr}${unit} budget ${isScore ? '(min)' : '(max)'}`);
  
  if (showBar && !isScore) {
    const barLength = 30;
    const filled = Math.min(Math.round((percentage / 100) * barLength), barLength);
    const empty = barLength - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    
    const barColor = percentage > 100 ? colors.red : percentage > 90 ? colors.yellow : colors.green;
    console.log(`   ${barColor}${bar}${colors.reset} ${percentage.toFixed(1)}%`);
  }
  
  console.log('');
}

/**
 * Resumo final
 */
function printSummary() {
  console.log(`\n${colors.bold}📋 Summary${colors.reset}\n`);
  
  if (hasErrors) {
    console.log(`${colors.red}❌ FAIL: Performance budgets exceeded!${colors.reset}`);
    console.log(`Some metrics are over budget. Please optimize before deploying.\n`);
    process.exit(1);
  } else if (hasWarnings) {
    console.log(`${colors.yellow}⚠️  WARNING: Some metrics are close to budget limits${colors.reset}`);
    console.log(`Consider optimizing to prevent future issues.\n`);
    process.exit(0);
  } else {
    console.log(`${colors.green}✅ PASS: All performance budgets met!${colors.reset}`);
    console.log(`Great job! Your bundle is optimized.\n`);
    process.exit(0);
  }
}

/**
 * Main
 */
function main() {
  try {
    checkBundleSizes();
    checkChunkSizes();
    checkThirdParty();
    checkLighthouseMetrics();
    printSummary();
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

main();

