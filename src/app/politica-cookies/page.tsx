'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Cookie, 
  FileText, 
  Settings, 
  Eye, 
  BarChart3,
  Target,
  Shield,
  Mail,
  Calendar,
  CheckCircle,
  AlertCircle,
  Chrome,
  Globe,
  Trash2
} from 'lucide-react';

export default function PoliticaCookiesPage() {
  const lastUpdate = new Date('2025-12-10');
  const formatted = lastUpdate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -35% 0px' }
    );

    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const sections = [
    { id: 'introducao', title: 'O que são Cookies?', icon: Cookie },
    { id: 'tipos', title: 'Tipos de Cookies', icon: FileText },
    { id: 'cookies-usados', title: 'Cookies que Utilizamos', icon: Settings },
    { id: 'finalidade', title: 'Para que Usamos', icon: Target },
    { id: 'terceiros', title: 'Cookies de Terceiros', icon: Globe },
    { id: 'gerenciar', title: 'Como Gerenciar', icon: Settings },
    { id: 'navegadores', title: 'Configurar Navegadores', icon: Chrome },
    { id: 'consequencias', title: 'Desativar Cookies', icon: AlertCircle },
    { id: 'atualizacoes', title: 'Atualizações', icon: Eye },
    { id: 'contato', title: 'Contato', icon: Mail },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Premium */}
      <section className="relative border-b border-pharos-blue-700 bg-gradient-to-br from-pharos-blue-600 to-pharos-blue-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pharos-gold-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container relative z-10 mx-auto max-w-screen-xl px-6 py-20 sm:px-10 md:px-16 lg:px-24 lg:py-28">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-4 py-2 text-sm font-semibold border border-white/20">
              <Cookie className="h-4 w-4" />
              Transparência Digital
            </div>
            <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl mb-6 text-white drop-shadow-lg">
              Política de Cookies
            </h1>
            <p className="text-lg text-white/95 leading-relaxed mb-4 drop-shadow">
              Entenda como a <strong>Pharos Negócios Imobiliários</strong> utiliza cookies e tecnologias 
              similares para melhorar sua experiência de navegação, personalizar conteúdo e analisar o 
              desempenho do nosso site.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Vigente desde {formatted}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Conforme LGPD</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Layout com Sidebar */}
      <div className="container mx-auto max-w-screen-xl px-6 py-16 sm:px-10 md:px-16 lg:px-24">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar de Navegação */}
          <aside className="lg:w-80 shrink-0">
            <div className="lg:sticky lg:top-24 space-y-2">
              <h3 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Índice
              </h3>
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeSection === section.id
                          ? 'bg-pharos-blue-50 text-pharos-blue-700 border-l-4 border-pharos-blue-600'
                          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{section.title}</span>
                      </div>
                    </a>
                  );
                })}
              </nav>

              {/* Card de Ação Rápida */}
              <div className="mt-8 p-6 rounded-xl bg-amber-50 border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Gerenciar Cookies
                </h4>
                <p className="text-sm text-amber-800 mb-4">
                  Você pode gerenciar suas preferências de cookies diretamente nas configurações do seu navegador
                </p>
                <a
                  href="#gerenciar"
                  className="block text-sm font-medium text-amber-700 hover:text-amber-900 hover:underline"
                >
                  → Ver instruções detalhadas
                </a>
              </div>

              {/* Links Relacionados */}
              <div className="mt-6 p-6 rounded-xl bg-neutral-50 border border-neutral-200">
                <h4 className="font-semibold text-neutral-900 mb-3">Documentos Relacionados</h4>
                <div className="space-y-2 text-sm">
                  <Link href="/politica-privacidade" className="block text-pharos-blue-600 hover:underline">
                    → Política de Privacidade
                  </Link>
                  <Link href="/termos-de-uso" className="block text-pharos-blue-600 hover:underline">
                    → Termos de Uso
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Conteúdo Principal */}
          <main className="flex-1 min-w-0">
            <div className="prose prose-neutral max-w-none 
              prose-headings:font-bold prose-headings:text-neutral-900
              prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-12 prose-h2:pb-3 prose-h2:border-b prose-h2:border-neutral-200
              prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-8
              prose-p:text-neutral-700 prose-p:leading-relaxed prose-p:mb-4
              prose-a:text-pharos-blue-600 prose-a:no-underline hover:prose-a:text-pharos-blue-700 hover:prose-a:underline
              prose-strong:text-neutral-900 prose-strong:font-semibold
              prose-ul:my-4 prose-li:text-neutral-700 prose-li:my-2">
              
              {/* 1. Introdução */}
              <section id="introducao" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Cookie className="h-7 w-7 text-pharos-blue-600" />
                  1. O que são Cookies?
                </h2>
                <p>
                  Cookies são <strong>pequenos arquivos de texto</strong> que são armazenados no seu dispositivo 
                  (computador, smartphone ou tablet) quando você visita um site. Eles são amplamente utilizados 
                  para fazer os sites funcionarem de forma mais eficiente, além de fornecer informações aos 
                  proprietários do site.
                </p>
                <p>
                  Os cookies permitem que o site "lembre" de suas ações e preferências (como idioma, favoritos, 
                  filtros de busca) durante um período de tempo, para que você não precise reconfigurá-las toda 
                  vez que retornar ao site ou navegar entre páginas.
                </p>

                <h3>Tecnologias Similares</h3>
                <p>
                  Além de cookies, utilizamos outras tecnologias similares como:
                </p>
                <ul>
                  <li><strong>Web Beacons (pixels):</strong> pequenas imagens invisíveis em páginas ou e-mails 
                    que nos ajudam a entender como você interage com o conteúdo</li>
                  <li><strong>Local Storage:</strong> armazenamento local no navegador para guardar preferências 
                    e dados de sessão</li>
                  <li><strong>Session Storage:</strong> armazenamento temporário que dura apenas enquanto o 
                    navegador está aberto</li>
                </ul>

                <p>
                  Nesta política, usamos o termo "cookies" para nos referir a todas essas tecnologias.
                </p>
              </section>

              {/* 2. Tipos de Cookies */}
              <section id="tipos" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <FileText className="h-7 w-7 text-pharos-blue-600" />
                  2. Tipos de Cookies
                </h2>
                
                <p>
                  Os cookies podem ser classificados de diferentes maneiras:
                </p>

                <h3>2.1. Por Finalidade</h3>
                
                <div className="not-prose space-y-4 my-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Cookies Essenciais (Necessários)
                    </h4>
                    <p className="text-sm text-green-800 mb-2">
                      Fundamentais para o funcionamento básico do site. Sem eles, algumas funcionalidades 
                      não estariam disponíveis.
                    </p>
                    <p className="text-xs text-green-700">
                      <strong>Exemplos:</strong> autenticação de sessão, segurança, balanceamento de carga
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Cookies de Desempenho e Analytics
                    </h4>
                    <p className="text-sm text-blue-800 mb-2">
                      Coletam informações sobre como você usa o site, permitindo-nos melhorar seu funcionamento 
                      e experiência.
                    </p>
                    <p className="text-xs text-blue-700">
                      <strong>Exemplos:</strong> Google Analytics, métricas de páginas visitadas, tempo de permanência
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
                    <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Cookies de Funcionalidade
                    </h4>
                    <p className="text-sm text-purple-800 mb-2">
                      Permitem que o site lembre suas escolhas e preferências para fornecer recursos aprimorados 
                      e personalizados.
                    </p>
                    <p className="text-xs text-purple-700">
                      <strong>Exemplos:</strong> filtros salvos, imóveis favoritos, preferências de exibição
                    </p>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-5">
                    <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Cookies de Marketing e Publicidade
                    </h4>
                    <p className="text-sm text-orange-800 mb-2">
                      Rastreiam sua navegação para exibir anúncios relevantes e medir a eficácia de campanhas 
                      publicitárias.
                    </p>
                    <p className="text-xs text-orange-700">
                      <strong>Exemplos:</strong> Facebook Pixel, Google Ads, remarketing, parâmetros UTM
                    </p>
                  </div>
                </div>

                <h3>2.2. Por Duração</h3>
                <ul>
                  <li><strong>Cookies de Sessão:</strong> temporários, excluídos automaticamente quando você 
                    fecha o navegador</li>
                  <li><strong>Cookies Persistentes:</strong> permanecem no seu dispositivo por um período 
                    definido (de dias a anos) mesmo após fechar o navegador</li>
                </ul>

                <h3>2.3. Por Origem</h3>
                <ul>
                  <li><strong>Cookies Próprios (First-party):</strong> definidos diretamente pelo nosso site</li>
                  <li><strong>Cookies de Terceiros (Third-party):</strong> definidos por serviços externos 
                    que usamos (Google, Facebook, etc.)</li>
                </ul>
              </section>

              {/* 3. Cookies que Utilizamos */}
              <section id="cookies-usados" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Settings className="h-7 w-7 text-pharos-blue-600" />
                  3. Cookies que Utilizamos
                </h2>
                
                <p>
                  O site da Pharos Negócios Imobiliários utiliza os seguintes cookies:
                </p>

                <div className="not-prose overflow-x-auto my-6">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-pharos-blue-50">
                        <th className="border border-pharos-blue-200 px-4 py-3 text-left font-semibold text-pharos-blue-900">
                          Nome
                        </th>
                        <th className="border border-pharos-blue-200 px-4 py-3 text-left font-semibold text-pharos-blue-900">
                          Tipo
                        </th>
                        <th className="border border-pharos-blue-200 px-4 py-3 text-left font-semibold text-pharos-blue-900">
                          Finalidade
                        </th>
                        <th className="border border-pharos-blue-200 px-4 py-3 text-left font-semibold text-pharos-blue-900">
                          Duração
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-neutral-200 px-4 py-3 font-mono text-xs">pharos_session</td>
                        <td className="border border-neutral-200 px-4 py-3">Essencial</td>
                        <td className="border border-neutral-200 px-4 py-3">Identificar sessão do usuário</td>
                        <td className="border border-neutral-200 px-4 py-3">Sessão</td>
                      </tr>
                      <tr className="bg-neutral-50">
                        <td className="border border-neutral-200 px-4 py-3 font-mono text-xs">pharos_favorites</td>
                        <td className="border border-neutral-200 px-4 py-3">Funcionalidade</td>
                        <td className="border border-neutral-200 px-4 py-3">Armazenar imóveis favoritos</td>
                        <td className="border border-neutral-200 px-4 py-3">1 ano</td>
                      </tr>
                      <tr>
                        <td className="border border-neutral-200 px-4 py-3 font-mono text-xs">pharos_filters</td>
                        <td className="border border-neutral-200 px-4 py-3">Funcionalidade</td>
                        <td className="border border-neutral-200 px-4 py-3">Salvar filtros de busca</td>
                        <td className="border border-neutral-200 px-4 py-3">30 dias</td>
                      </tr>
                      <tr className="bg-neutral-50">
                        <td className="border border-neutral-200 px-4 py-3 font-mono text-xs">_ga</td>
                        <td className="border border-neutral-200 px-4 py-3">Analytics</td>
                        <td className="border border-neutral-200 px-4 py-3">Google Analytics - ID único</td>
                        <td className="border border-neutral-200 px-4 py-3">2 anos</td>
                      </tr>
                      <tr>
                        <td className="border border-neutral-200 px-4 py-3 font-mono text-xs">_ga_*</td>
                        <td className="border border-neutral-200 px-4 py-3">Analytics</td>
                        <td className="border border-neutral-200 px-4 py-3">Google Analytics 4 - estado de sessão</td>
                        <td className="border border-neutral-200 px-4 py-3">2 anos</td>
                      </tr>
                      <tr className="bg-neutral-50">
                        <td className="border border-neutral-200 px-4 py-3 font-mono text-xs">_fbp</td>
                        <td className="border border-neutral-200 px-4 py-3">Marketing</td>
                        <td className="border border-neutral-200 px-4 py-3">Facebook Pixel - rastreamento</td>
                        <td className="border border-neutral-200 px-4 py-3">3 meses</td>
                      </tr>
                      <tr>
                        <td className="border border-neutral-200 px-4 py-3 font-mono text-xs">_gcl_au</td>
                        <td className="border border-neutral-200 px-4 py-3">Marketing</td>
                        <td className="border border-neutral-200 px-4 py-3">Google Ads - conversões</td>
                        <td className="border border-neutral-200 px-4 py-3">3 meses</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-sm text-neutral-600">
                  <strong>Nota:</strong> Esta lista pode ser atualizada conforme adicionamos ou removemos 
                  serviços. A versão mais atualizada estará sempre disponível nesta página.
                </p>
              </section>

              {/* 4. Finalidade */}
              <section id="finalidade" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Target className="h-7 w-7 text-pharos-blue-600" />
                  4. Para que Usamos Cookies
                </h2>
                
                <p>
                  Utilizamos cookies para diversos propósitos essenciais ao funcionamento e melhoria do nosso site:
                </p>

                <h3>4.1. Funcionalidades Essenciais</h3>
                <ul>
                  <li>Manter você logado durante a navegação</li>
                  <li>Lembrar itens no carrinho ou lista de favoritos</li>
                  <li>Garantir segurança e prevenir fraudes</li>
                  <li>Balancear carga entre servidores</li>
                </ul>

                <h3>4.2. Personalização da Experiência</h3>
                <ul>
                  <li>Lembrar suas preferências de busca e filtros</li>
                  <li>Recomendar imóveis compatíveis com seu perfil</li>
                  <li>Adaptar o conteúdo aos seus interesses</li>
                  <li>Salvar configurações de visualização</li>
                </ul>

                <h3>4.3. Análise e Desempenho</h3>
                <ul>
                  <li>Entender como você usa o site (páginas visitadas, tempo de permanência)</li>
                  <li>Identificar problemas técnicos e páginas de erro</li>
                  <li>Medir o desempenho de recursos e funcionalidades</li>
                  <li>Tomar decisões baseadas em dados sobre melhorias</li>
                </ul>

                <h3>4.4. Marketing e Publicidade</h3>
                <ul>
                  <li>Exibir anúncios relevantes sobre imóveis do seu interesse</li>
                  <li>Medir a eficácia de campanhas publicitárias</li>
                  <li>Fazer remarketing (mostrar anúncios em outros sites)</li>
                  <li>Rastrear origem de visitantes (campanhas, redes sociais)</li>
                </ul>
              </section>

              {/* 5. Cookies de Terceiros */}
              <section id="terceiros" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Globe className="h-7 w-7 text-pharos-blue-600" />
                  5. Cookies de Terceiros
                </h2>
                
                <p>
                  Utilizamos serviços de terceiros que podem definir cookies em seu dispositivo quando você 
                  visita nosso site:
                </p>

                <h3>5.1. Google Analytics</h3>
                <p>
                  Ferramenta de análise web que nos ajuda a entender como os visitantes interagem com nosso site.
                </p>
                <ul>
                  <li><strong>Provedor:</strong> Google LLC</li>
                  <li><strong>Finalidade:</strong> Estatísticas de uso, métricas de desempenho</li>
                  <li><strong>Cookies:</strong> _ga, _ga_*, _gid, _gat</li>
                  <li><strong>Política:</strong>{' '}
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                      Google Privacy Policy
                    </a>
                  </li>
                </ul>

                <h3>5.2. Facebook Pixel</h3>
                <p>
                  Ferramenta de análise que mede a eficácia de anúncios no Facebook e Instagram.
                </p>
                <ul>
                  <li><strong>Provedor:</strong> Meta Platforms, Inc.</li>
                  <li><strong>Finalidade:</strong> Rastreamento de conversões, remarketing, públicos personalizados</li>
                  <li><strong>Cookies:</strong> _fbp, fr</li>
                  <li><strong>Política:</strong>{' '}
                    <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer">
                      Meta Privacy Policy
                    </a>
                  </li>
                </ul>

                <h3>5.3. Google Ads</h3>
                <p>
                  Plataforma de publicidade do Google para exibir anúncios relevantes.
                </p>
                <ul>
                  <li><strong>Provedor:</strong> Google LLC</li>
                  <li><strong>Finalidade:</strong> Remarketing, medição de conversões, otimização de anúncios</li>
                  <li><strong>Cookies:</strong> _gcl_*, IDE, test_cookie</li>
                </ul>

                <div className="not-prose bg-blue-50 border border-blue-200 rounded-lg p-5 my-6">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Controle de Terceiros</h4>
                      <p className="text-sm text-blue-800">
                        Não temos controle sobre cookies de terceiros. Recomendamos que você leia as políticas 
                        de privacidade desses serviços para entender como eles coletam e usam dados.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 6. Como Gerenciar */}
              <section id="gerenciar" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Settings className="h-7 w-7 text-pharos-blue-600" />
                  6. Como Gerenciar e Controlar Cookies
                </h2>
                
                <p>
                  Você tem total controle sobre os cookies e pode gerenciá-los de diversas formas:
                </p>

                <h3>6.1. Configurações do Navegador</h3>
                <p>
                  A maioria dos navegadores permite que você:
                </p>
                <ul>
                  <li>Veja quais cookies estão armazenados</li>
                  <li>Bloqueie todos os cookies ou apenas de terceiros</li>
                  <li>Exclua cookies específicos ou todos</li>
                  <li>Configure exceções para sites confiáveis</li>
                  <li>Receba notificações antes de aceitar cookies</li>
                </ul>

                <h3>6.2. Opt-out de Publicidade</h3>
                <p>
                  Para desativar anúncios personalizados:
                </p>
                <ul>
                  <li><strong>Google:</strong>{' '}
                    <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
                      Configurações de Anúncios do Google
                    </a>
                  </li>
                  <li><strong>Facebook:</strong>{' '}
                    <a href="https://www.facebook.com/ads/preferences" target="_blank" rel="noopener noreferrer">
                      Preferências de Anúncios do Facebook
                    </a>
                  </li>
                  <li><strong>Your Online Choices:</strong>{' '}
                    <a href="https://www.youronlinechoices.com/br/" target="_blank" rel="noopener noreferrer">
                      youronlinechoices.com/br
                    </a>
                  </li>
                </ul>

                <h3>6.3. Modo Anônimo/Privado</h3>
                <p>
                  Você pode navegar em modo privado (incógnito), onde os cookies são excluídos automaticamente 
                  ao fechar o navegador. Note que isso não o torna completamente anônimo online.
                </p>
              </section>

              {/* 7. Configurar Navegadores */}
              <section id="navegadores" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Chrome className="h-7 w-7 text-pharos-blue-600" />
                  7. Como Configurar Cookies nos Principais Navegadores
                </h2>
                
                <p>
                  Instruções específicas para gerenciar cookies nos navegadores mais populares:
                </p>

                <div className="not-prose space-y-4 my-6">
                  <details className="bg-neutral-50 border border-neutral-200 rounded-lg p-5">
                    <summary className="font-semibold text-neutral-900 cursor-pointer">
                      Google Chrome
                    </summary>
                    <ol className="mt-3 space-y-2 text-sm text-neutral-700 list-decimal list-inside">
                      <li>Clique no menu (três pontos) no canto superior direito</li>
                      <li>Vá em <strong>Configurações</strong></li>
                      <li>Clique em <strong>Privacidade e segurança</strong></li>
                      <li>Selecione <strong>Cookies e outros dados de sites</strong></li>
                      <li>Escolha suas preferências ou clique em <strong>Ver todos os cookies e dados de sites</strong></li>
                    </ol>
                  </details>

                  <details className="bg-neutral-50 border border-neutral-200 rounded-lg p-5">
                    <summary className="font-semibold text-neutral-900 cursor-pointer">
                      Mozilla Firefox
                    </summary>
                    <ol className="mt-3 space-y-2 text-sm text-neutral-700 list-decimal list-inside">
                      <li>Clique no menu (três linhas) no canto superior direito</li>
                      <li>Vá em <strong>Opções</strong> ou <strong>Preferências</strong></li>
                      <li>Clique em <strong>Privacidade e segurança</strong> no menu lateral</li>
                      <li>Em <strong>Cookies e dados de sites</strong>, clique em <strong>Gerenciar dados</strong></li>
                      <li>Ajuste as configurações conforme desejado</li>
                    </ol>
                  </details>

                  <details className="bg-neutral-50 border border-neutral-200 rounded-lg p-5">
                    <summary className="font-semibold text-neutral-900 cursor-pointer">
                      Safari (macOS)
                    </summary>
                    <ol className="mt-3 space-y-2 text-sm text-neutral-700 list-decimal list-inside">
                      <li>Abra o Safari e clique em <strong>Safari</strong> no menu superior</li>
                      <li>Selecione <strong>Preferências</strong></li>
                      <li>Clique na aba <strong>Privacidade</strong></li>
                      <li>Configure o bloqueio de cookies conforme desejado</li>
                      <li>Clique em <strong>Gerenciar Dados de Sites</strong> para ver e remover cookies específicos</li>
                    </ol>
                  </details>

                  <details className="bg-neutral-50 border border-neutral-200 rounded-lg p-5">
                    <summary className="font-semibold text-neutral-900 cursor-pointer">
                      Microsoft Edge
                    </summary>
                    <ol className="mt-3 space-y-2 text-sm text-neutral-700 list-decimal list-inside">
                      <li>Clique no menu (três pontos) no canto superior direito</li>
                      <li>Vá em <strong>Configurações</strong></li>
                      <li>Clique em <strong>Privacidade, pesquisa e serviços</strong></li>
                      <li>Em <strong>Cookies e outros dados de site</strong>, ajuste suas preferências</li>
                      <li>Clique em <strong>Gerenciar e excluir cookies e dados de site</strong> para mais opções</li>
                    </ol>
                  </details>
                </div>

                <p className="text-sm text-neutral-600">
                  Para outros navegadores ou versões mobile, consulte a documentação oficial do respectivo navegador.
                </p>
              </section>

              {/* 8. Consequências */}
              <section id="consequencias" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <AlertCircle className="h-7 w-7 text-pharos-blue-600" />
                  8. Consequências de Desativar Cookies
                </h2>
                
                <p>
                  Você pode usar nosso site sem aceitar cookies, mas isso pode afetar sua experiência:
                </p>

                <div className="not-prose bg-amber-50 border border-amber-200 rounded-lg p-5 my-6">
                  <div className="flex gap-3">
                    <Trash2 className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-3">O que pode não funcionar:</h4>
                      <ul className="space-y-2 text-sm text-amber-800">
                        <li>• <strong>Login e autenticação:</strong> você pode não conseguir manter-se logado</li>
                        <li>• <strong>Favoritos:</strong> imóveis favoritos não serão salvos entre sessões</li>
                        <li>• <strong>Filtros e preferências:</strong> precisará reconfigurar a cada visita</li>
                        <li>• <strong>Funcionalidades interativas:</strong> algumas features podem parar de funcionar</li>
                        <li>• <strong>Desempenho:</strong> o site pode carregar mais lentamente</li>
                        <li>• <strong>Recomendações:</strong> sugestões de imóveis serão genéricas</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <p>
                  <strong>Cookies essenciais</strong> são necessários para o funcionamento básico do site. 
                  Bloqueá-los pode impedir o uso de serviços importantes. Recomendamos manter cookies 
                  essenciais ativados e gerenciar individualmente cookies de analytics e marketing.
                </p>
              </section>

              {/* 9. Atualizações */}
              <section id="atualizacoes" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Eye className="h-7 w-7 text-pharos-blue-600" />
                  9. Atualizações desta Política
                </h2>
                
                <p>
                  Esta Política de Cookies pode ser atualizada periodicamente para refletir:
                </p>
                <ul>
                  <li>Mudanças nas tecnologias que utilizamos</li>
                  <li>Adição ou remoção de serviços de terceiros</li>
                  <li>Alterações na legislação aplicável</li>
                  <li>Melhorias na clareza e transparência</li>
                </ul>

                <p>
                  Quando houver alterações significativas, informaremos através de aviso no site. A versão 
                  mais atualizada estará sempre disponível nesta página, com a data de vigência indicada no início.
                </p>

                <p>
                  Recomendamos que você revise esta política periodicamente para se manter informado sobre 
                  como usamos cookies.
                </p>
              </section>

              {/* 10. Contato */}
              <section id="contato" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Mail className="h-7 w-7 text-pharos-blue-600" />
                  10. Contato e Mais Informações
                </h2>
                
                <p>
                  Se você tiver dúvidas sobre nossa utilização de cookies ou desejar exercer seus direitos 
                  relacionados a dados pessoais, entre em contato conosco:
                </p>

                <div className="not-prose bg-pharos-blue-50 border border-pharos-blue-200 rounded-xl p-6 my-6">
                  <h4 className="font-semibold text-pharos-blue-900 mb-4">Canais de Contato</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-pharos-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-pharos-blue-900">E-mail</p>
                        <a 
                          href="mailto:contato@pharosnegocios.com.br" 
                          className="text-pharos-blue-600 hover:underline"
                        >
                          contato@pharosnegocios.com.br
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Chrome className="h-5 w-5 text-pharos-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-pharos-blue-900">Telefone/WhatsApp</p>
                        <a 
                          href="tel:+5547991878070" 
                          className="text-pharos-blue-600 hover:underline"
                        >
                          (47) 9 9187-8070
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <h3>Recursos Adicionais</h3>
                <p>
                  Para mais informações sobre cookies e privacidade online:
                </p>
                <ul>
                  <li><strong>All About Cookies:</strong>{' '}
                    <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer">
                      www.allaboutcookies.org
                    </a>
                  </li>
                  <li><strong>Autoridade Nacional de Proteção de Dados (ANPD):</strong>{' '}
                    <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer">
                      www.gov.br/anpd
                    </a>
                  </li>
                  <li><strong>Your Online Choices (Europa):</strong>{' '}
                    <a href="https://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer">
                      www.youronlinechoices.com
                    </a>
                  </li>
                </ul>
              </section>

              {/* Footer da Política */}
              <div className="not-prose mt-16 pt-8 border-t border-neutral-200">
                <div className="bg-gradient-to-br from-pharos-blue-50 to-pharos-gold-50 rounded-xl p-8 text-center">
                  <Cookie className="h-12 w-12 text-pharos-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">
                    Transparência no Uso de Cookies
                  </h3>
                  <p className="text-neutral-700 mb-6 max-w-2xl mx-auto">
                    Utilizamos cookies para melhorar sua experiência, personalizar conteúdo e entender como 
                    você usa nosso site. Você tem total controle sobre suas preferências.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <a
                      href="#gerenciar"
                      className="inline-flex items-center gap-2 bg-pharos-blue-600 hover:bg-pharos-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      <Settings className="h-5 w-5" />
                      Gerenciar Cookies
                    </a>
                    <Link
                      href="/politica-privacidade"
                      className="inline-flex items-center gap-2 bg-white hover:bg-neutral-50 text-pharos-blue-700 border border-pharos-blue-200 px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      <Shield className="h-5 w-5" />
                      Política de Privacidade
                    </Link>
                  </div>
                </div>

                <div className="mt-8 text-center text-sm text-neutral-600">
                  <p>
                    <strong>Última atualização:</strong> {formatted} • <strong>Versão:</strong> 1.0
                  </p>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

