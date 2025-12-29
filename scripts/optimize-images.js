const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
  { width: 640, suffix: '-mobile' },
  { width: 1024, suffix: '-tablet' },
  { width: 1920, suffix: '-desktop' },
  { width: 2560, suffix: '-2k' },
];

async function optimizeImage(inputPath, outputDir) {
  const filename = path.basename(inputPath, path.extname(inputPath));
  
  // Criar diretório de saída se não existir
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log(`\n📸 Otimizando: ${inputPath}`);
  
  for (const { width, suffix } of sizes) {
    // WebP
    const webpPath = path.join(outputDir, `${filename}${suffix}.webp`);
    await sharp(inputPath)
      .resize(width, null, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 70, effort: 6 })
      .toFile(webpPath);
    
    const webpStats = fs.statSync(webpPath);
    console.log(`  ✅ ${filename}${suffix}.webp - ${(webpStats.size / 1024).toFixed(2)}KB`);
    
    // AVIF (melhor compressão)
    const avifPath = path.join(outputDir, `${filename}${suffix}.avif`);
    await sharp(inputPath)
      .resize(width, null, { fit: 'inside', withoutEnlargement: true })
      .avif({ quality: 60, effort: 6 })
      .toFile(avifPath);
    
    const avifStats = fs.statSync(avifPath);
    console.log(`  ✅ ${filename}${suffix}.avif - ${(avifStats.size / 1024).toFixed(2)}KB`);
  }
}

async function main() {
  const bannerInput = 'public/images/banners/balneario-camboriu.webp';
  const bannerOutput = 'public/images/banners/optimized';
  
  console.log('🚀 Iniciando otimização de imagens...\n');
  
  if (fs.existsSync(bannerInput)) {
    await optimizeImage(bannerInput, bannerOutput);
  } else {
    console.log(`⚠️  Arquivo não encontrado: ${bannerInput}`);
  }
  
  console.log('\n✨ Otimização concluída!\n');
}

main().catch(console.error);

