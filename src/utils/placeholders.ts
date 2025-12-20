/**
 * Placeholders SVG Otimizados
 * SVGs leves (< 1KB cada) para substituir imagens Unsplash
 * Base64 encoded para uso direto em src
 */

/**
 * Converte SVG para data URL base64
 */
function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Placeholder genérico para imóveis
 * Gradiente azul Pharos com ícone de casa
 */
export const PLACEHOLDER_IMOVEL = svgToDataUrl(`
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#054ADA;stop-opacity:0.1" />
      <stop offset="100%" style="stop-color:#192233;stop-opacity:0.2" />
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#grad)"/>
  <path d="M400 250 L500 320 L500 450 L300 450 L300 320 Z" fill="#054ADA" opacity="0.15"/>
  <rect x="340" y="380" width="40" height="70" fill="#054ADA" opacity="0.2"/>
  <rect x="420" y="350" width="35" height="35" fill="#054ADA" opacity="0.2"/>
  <rect x="345" y="350" width="35" height="35" fill="#054ADA" opacity="0.2"/>
</svg>
`);

/**
 * Placeholder para apartamento moderno
 */
export const PLACEHOLDER_APARTAMENTO = svgToDataUrl(`
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#043BAE;stop-opacity:0.12" />
      <stop offset="100%" style="stop-color:#054ADA;stop-opacity:0.18" />
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#grad2)"/>
  <rect x="250" y="150" width="300" height="300" rx="4" fill="#054ADA" opacity="0.12"/>
  <line x1="250" y1="250" x2="550" y2="250" stroke="#054ADA" stroke-width="2" opacity="0.15"/>
  <line x1="250" y1="350" x2="550" y2="350" stroke="#054ADA" stroke-width="2" opacity="0.15"/>
  <line x1="400" y1="150" x2="400" y2="450" stroke="#054ADA" stroke-width="2" opacity="0.15"/>
</svg>
`);

/**
 * Placeholder para vista cidade/balneário
 */
export const PLACEHOLDER_CIDADE = svgToDataUrl(`
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad3" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#054ADA;stop-opacity:0.15" />
      <stop offset="70%" style="stop-color:#192233;stop-opacity:0.08" />
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#grad3)"/>
  <rect x="100" y="300" width="60" height="180" fill="#054ADA" opacity="0.15"/>
  <rect x="180" y="250" width="60" height="230" fill="#054ADA" opacity="0.18"/>
  <rect x="260" y="280" width="60" height="200" fill="#054ADA" opacity="0.12"/>
  <rect x="340" y="200" width="60" height="280" fill="#054ADA" opacity="0.2"/>
  <rect x="420" y="260" width="60" height="220" fill="#054ADA" opacity="0.14"/>
  <rect x="500" y="320" width="60" height="160" fill="#054ADA" opacity="0.16"/>
  <rect x="580" y="290" width="60" height="190" fill="#054ADA" opacity="0.13"/>
</svg>
`);

/**
 * Placeholder para sala/interior
 */
export const PLACEHOLDER_SALA = svgToDataUrl(`
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#F7F9FC;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#E6EFFC;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#grad4)"/>
  <rect x="150" y="300" width="200" height="120" rx="8" fill="#054ADA" opacity="0.08"/>
  <rect x="450" y="200" width="250" height="280" rx="4" fill="#054ADA" opacity="0.06"/>
  <circle cx="300" cy="150" r="40" fill="#C89C4D" opacity="0.12"/>
</svg>
`);

/**
 * Placeholder para cozinha
 */
export const PLACEHOLDER_COZINHA = svgToDataUrl(`
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#F7F9FC"/>
  <rect x="100" y="150" width="600" height="300" fill="#054ADA" opacity="0.06"/>
  <rect x="150" y="200" width="150" height="200" rx="4" fill="#054ADA" opacity="0.1"/>
  <rect x="350" y="200" width="150" height="200" rx="4" fill="#054ADA" opacity="0.08"/>
  <rect x="550" y="200" width="100" height="200" rx="4" fill="#054ADA" opacity="0.12"/>
  <circle cx="225" cy="280" r="20" fill="#C89C4D" opacity="0.15"/>
  <circle cx="425" cy="280" r="20" fill="#C89C4D" opacity="0.15"/>
</svg>
`);

/**
 * Placeholder para quarto
 */
export const PLACEHOLDER_QUARTO = svgToDataUrl(`
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#192233;stop-opacity:0.05" />
      <stop offset="100%" style="stop-color:#054ADA;stop-opacity:0.12" />
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#grad5)"/>
  <rect x="200" y="250" width="400" height="200" rx="8" fill="#054ADA" opacity="0.12"/>
  <rect x="220" y="270" width="80" height="160" rx="4" fill="#054ADA" opacity="0.08"/>
  <rect x="520" y="270" width="60" height="160" rx="4" fill="#054ADA" opacity="0.08"/>
</svg>
`);

/**
 * Placeholder para casa/exterior
 */
export const PLACEHOLDER_CASA = svgToDataUrl(`
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad6" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#E6EFFC;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#F7F9FC;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#grad6)"/>
  <path d="M400 180 L600 300 L600 480 L200 480 L200 300 Z" fill="#054ADA" opacity="0.1"/>
  <rect x="300" y="380" width="80" height="100" fill="#054ADA" opacity="0.15"/>
  <rect x="450" y="340" width="60" height="60" fill="#054ADA" opacity="0.12"/>
  <rect x="280" y="340" width="60" height="60" fill="#054ADA" opacity="0.12"/>
</svg>
`);

/**
 * Placeholder para banner/hero
 */
export const PLACEHOLDER_BANNER = svgToDataUrl(`
<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad7" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#054ADA;stop-opacity:0.2" />
      <stop offset="50%" style="stop-color:#192233;stop-opacity:0.15" />
      <stop offset="100%" style="stop-color:#054ADA;stop-opacity:0.1" />
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#grad7)"/>
  <circle cx="960" cy="540" r="200" fill="#054ADA" opacity="0.08"/>
  <circle cx="960" cy="540" r="140" fill="#054ADA" opacity="0.12"/>
  <path d="M960 450 L1020 510 L1020 600 L900 600 L900 510 Z" fill="#054ADA" opacity="0.15"/>
</svg>
`);

/**
 * Placeholder para pessoa/corretor
 */
export const PLACEHOLDER_PESSOA = svgToDataUrl(`
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad8" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#054ADA;stop-opacity:0.15" />
      <stop offset="100%" style="stop-color:#192233;stop-opacity:0.25" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="100" fill="url(#grad8)"/>
  <circle cx="100" cy="75" r="30" fill="#054ADA" opacity="0.3"/>
  <path d="M60 140 Q100 110 140 140 L140 160 Q100 130 60 160 Z" fill="#054ADA" opacity="0.25"/>
</svg>
`);

/**
 * Mapa de placeholders por tipo
 */
export const PLACEHOLDERS = {
  imovel: PLACEHOLDER_IMOVEL,
  apartamento: PLACEHOLDER_APARTAMENTO,
  cidade: PLACEHOLDER_CIDADE,
  sala: PLACEHOLDER_SALA,
  cozinha: PLACEHOLDER_COZINHA,
  quarto: PLACEHOLDER_QUARTO,
  casa: PLACEHOLDER_CASA,
  banner: PLACEHOLDER_BANNER,
  pessoa: PLACEHOLDER_PESSOA,
} as const;

/**
 * Obtém placeholder por tipo (com fallback)
 */
export function getPlaceholder(tipo: keyof typeof PLACEHOLDERS = 'imovel'): string {
  return PLACEHOLDERS[tipo] || PLACEHOLDER_IMOVEL;
}

