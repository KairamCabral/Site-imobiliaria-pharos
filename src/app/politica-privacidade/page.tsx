'use client';

import type { Metadata } from 'next';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Shield, 
  FileText, 
  Database, 
  Lock, 
  Users, 
  Cookie, 
  Eye,
  AlertCircle,
  CheckCircle,
  Mail,
  Phone,
  Building,
  Calendar,
  Globe,
  Scale
} from 'lucide-react';

export default function PoliticaPrivacidadePage() {
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
    { id: 'introducao', title: 'Introdução', icon: FileText },
    { id: 'controlador', title: 'Controlador de Dados', icon: Building },
    { id: 'dados-coletados', title: 'Dados Coletados', icon: Database },
    { id: 'finalidades', title: 'Finalidades e Bases Legais', icon: Scale },
    { id: 'cookies', title: 'Cookies e Tecnologias', icon: Cookie },
    { id: 'compartilhamento', title: 'Compartilhamento', icon: Users },
    { id: 'seguranca', title: 'Segurança dos Dados', icon: Lock },
    { id: 'retencao', title: 'Retenção de Dados', icon: Calendar },
    { id: 'direitos', title: 'Seus Direitos', icon: Shield },
    { id: 'menores', title: 'Crianças e Adolescentes', icon: AlertCircle },
    { id: 'transferencia', title: 'Transferência Internacional', icon: Globe },
    { id: 'atualizacoes', title: 'Atualizações', icon: Eye },
    { id: 'contato', title: 'Contato e Reclamações', icon: Mail },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Premium com Fundo Azul */}
      <section className="relative border-b border-pharos-blue-700 bg-gradient-to-br from-pharos-blue-600 to-pharos-blue-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pharos-gold-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container relative z-10 mx-auto max-w-screen-xl px-6 py-20 sm:px-10 md:px-16 lg:px-24 lg:py-28">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-4 py-2 text-sm font-semibold border border-white/20">
              <Shield className="h-4 w-4" />
              Privacidade e LGPD
            </div>
            <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl mb-6 text-white drop-shadow-lg">
              Política de Privacidade
            </h1>
            <p className="text-lg text-white/95 leading-relaxed mb-4 drop-shadow">
              A <strong>Pharos Negócios Imobiliários</strong> valoriza sua privacidade e está comprometida com a 
              proteção dos seus dados pessoais. Esta política explica de forma transparente e completa como 
              coletamos, utilizamos, armazenamos e protegemos suas informações em conformidade com a 
              <strong> Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)</strong>.
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

              {/* Card de Contato Rápido */}
              <div className="mt-8 p-6 rounded-xl bg-pharos-blue-50 border border-pharos-blue-100">
                <h4 className="font-semibold text-pharos-blue-900 mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Dúvidas sobre privacidade?
                </h4>
                <p className="text-sm text-pharos-blue-700 mb-4">
                  Entre em contato com nosso Encarregado de Proteção de Dados
                </p>
                <a
                  href="mailto:contato@pharosnegocios.com.br"
                  className="block text-sm font-medium text-pharos-blue-700 hover:text-pharos-blue-900 mb-2"
                >
                  contato@pharosnegocios.com.br
                </a>
                <a
                  href="tel:+5547991878070"
                  className="block text-sm font-medium text-pharos-blue-700 hover:text-pharos-blue-900"
                >
                  (47) 9 9187-8070
                </a>
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
              prose-ul:my-4 prose-li:text-neutral-700 prose-li:my-2
              prose-code:text-pharos-blue-700 prose-code:bg-pharos-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
              
              {/* 1. Introdução */}
              <section id="introducao" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <FileText className="h-7 w-7 text-pharos-blue-600" />
                  1. Introdução
                </h2>
                <p>
                  Esta Política de Privacidade descreve como a <strong>Pharos Negócios Imobiliários</strong> trata 
                  os dados pessoais coletados através do nosso site, formulários de contato, comunicações via WhatsApp, 
                  campanhas de marketing e qualquer outra forma de interação com nossos serviços imobiliários.
                </p>
                <p>
                  Ao utilizar nossos serviços, você concorda com as práticas descritas nesta política. Recomendamos 
                  a leitura atenta de todos os tópicos para compreender seus direitos e nossas obrigações em relação 
                  aos seus dados pessoais.
                </p>
              </section>

              {/* 2. Controlador de Dados */}
              <section id="controlador" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Building className="h-7 w-7 text-pharos-blue-600" />
                  2. Controlador de Dados e DPO
                </h2>
                
                <div className="not-prose bg-neutral-50 border border-neutral-200 rounded-xl p-6 my-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-3">Dados da Empresa</h4>
                      <ul className="space-y-2 text-sm text-neutral-700">
                        <li><strong>Razão Social:</strong> Pharos Negócios Imobiliários</li>
                        <li><strong>CNPJ:</strong> 51.040.966/0001-93</li>
                        <li><strong>CRECI:</strong> 40107</li>
                        <li><strong>Endereço:</strong> Rua 2300, 575, Sala 04</li>
                        <li><strong>Cidade:</strong> Centro, Balneário Camboriú/SC</li>
                        <li><strong>CEP:</strong> 88330-428</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-3">Encarregado de Proteção de Dados (DPO)</h4>
                      <ul className="space-y-2 text-sm text-neutral-700">
                        <li className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-pharos-blue-600" />
                          <a href="mailto:contato@pharosnegocios.com.br" className="text-pharos-blue-600 hover:underline">
                            contato@pharosnegocios.com.br
                          </a>
                        </li>
                        <li className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-pharos-blue-600" />
                          <a href="tel:+5547991878070" className="text-pharos-blue-600 hover:underline">
                            (47) 9 9187-8070
                          </a>
                        </li>
                      </ul>
                      <p className="text-xs text-neutral-600 mt-3">
                        Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de dados pessoais, 
                        entre em contato através dos canais acima.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. Dados Coletados */}
              <section id="dados-coletados" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Database className="h-7 w-7 text-pharos-blue-600" />
                  3. Dados Pessoais que Coletamos
                </h2>
                
                <p>
                  Coletamos diferentes categorias de dados pessoais dependendo da forma como você interage 
                  com nossos serviços:
                </p>

                <h3>3.1. Dados Fornecidos Voluntariamente</h3>
                <ul>
                  <li><strong>Dados de identificação:</strong> nome completo, CPF/CNPJ (quando necessário)</li>
                  <li><strong>Dados de contato:</strong> e-mail, telefone, endereço</li>
                  <li><strong>Preferências imobiliárias:</strong> tipo de imóvel, localização desejada, faixa de preço, 
                    número de quartos/banheiros, características específicas</li>
                  <li><strong>Mensagens e comunicações:</strong> conteúdo de formulários, conversas via WhatsApp, 
                    e-mails e outras interações</li>
                  <li><strong>Dados financeiros:</strong> informações sobre capacidade de pagamento (quando fornecidas 
                    voluntariamente para análise de imóveis)</li>
                  <li><strong>Documentos:</strong> comprovantes de renda, documentos de identificação (apenas quando 
                    necessário para formalização de negócios)</li>
                </ul>

                <h3>3.2. Dados Coletados Automaticamente</h3>
                <ul>
                  <li><strong>Dados de navegação:</strong> endereço IP, tipo de navegador, sistema operacional, 
                    resolução de tela</li>
                  <li><strong>Dados de uso:</strong> páginas visitadas, tempo de permanência, cliques, links acessados, 
                    origem do acesso</li>
                  <li><strong>Dados de dispositivo:</strong> modelo, fabricante, identificadores únicos, configurações</li>
                  <li><strong>Geolocalização:</strong> localização aproximada baseada no IP (não coletamos localização 
                    precisa sem consentimento explícito)</li>
                  <li><strong>Cookies e tecnologias similares:</strong> identificadores para sessão, preferências, 
                    analytics e remarketing</li>
                </ul>

                <h3>3.3. Dados de Campanhas de Marketing</h3>
                <ul>
                  <li><strong>Parâmetros UTM:</strong> origem, mídia, campanha, termo e conteúdo</li>
                  <li><strong>Histórico de interações:</strong> e-mails abertos, links clicados, formulários preenchidos</li>
                  <li><strong>Dados de conversão:</strong> ações realizadas após campanhas publicitárias</li>
                </ul>
              </section>

              {/* 4. Finalidades e Bases Legais */}
              <section id="finalidades" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Scale className="h-7 w-7 text-pharos-blue-600" />
                  4. Finalidades e Bases Legais do Tratamento
                </h2>
                
                <p>
                  Tratamos seus dados pessoais para as seguintes finalidades, sempre amparados por bases legais 
                  previstas na LGPD:
                </p>

                <div className="not-prose space-y-4 my-6">
                  {[
                    {
                      finalidade: 'Atendimento e prestação de serviços imobiliários',
                      base: 'Execução de contrato ou procedimentos preliminares (Art. 7º, V)',
                      exemplos: 'Responder solicitações, apresentar imóveis, negociar condições, intermediar transações'
                    },
                    {
                      finalidade: 'Comunicações de marketing e ofertas personalizadas',
                      base: 'Consentimento (Art. 7º, I) e Legítimo Interesse (Art. 7º, IX)',
                      exemplos: 'Enviar newsletters, ofertas de imóveis compatíveis com seu perfil, campanhas promocionais'
                    },
                    {
                      finalidade: 'Melhoria da experiência e personalização',
                      base: 'Legítimo Interesse (Art. 7º, IX)',
                      exemplos: 'Lembrar preferências, recomendar imóveis, otimizar navegação no site'
                    },
                    {
                      finalidade: 'Análise de desempenho e métricas',
                      base: 'Legítimo Interesse (Art. 7º, IX)',
                      exemplos: 'Estatísticas de uso, análise de campanhas, otimização de processos'
                    },
                    {
                      finalidade: 'Segurança e prevenção de fraudes',
                      base: 'Legítimo Interesse (Art. 7º, IX) e Proteção ao Crédito (Art. 7º, X)',
                      exemplos: 'Detectar atividades suspeitas, prevenir acessos não autorizados, proteger sistemas'
                    },
                    {
                      finalidade: 'Cumprimento de obrigações legais e regulatórias',
                      base: 'Obrigação Legal (Art. 7º, II)',
                      exemplos: 'Emitir documentos fiscais, atender demandas de autoridades, manter registros contábeis'
                    },
                    {
                      finalidade: 'Exercício regular de direitos',
                      base: 'Exercício Regular de Direitos (Art. 7º, VI)',
                      exemplos: 'Defender-se em processos judiciais, comprovar transações, auditorias'
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white border border-neutral-200 rounded-lg p-5">
                      <h4 className="font-semibold text-neutral-900 mb-2">{item.finalidade}</h4>
                      <p className="text-sm text-pharos-blue-700 mb-2">
                        <strong>Base Legal:</strong> {item.base}
                      </p>
                      <p className="text-sm text-neutral-600">
                        <strong>Exemplos:</strong> {item.exemplos}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="not-prose bg-amber-50 border border-amber-200 rounded-lg p-5 my-6">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-2">Revogação de Consentimento</h4>
                      <p className="text-sm text-amber-800">
                        Quando o tratamento for baseado em <strong>consentimento</strong>, você pode revogá-lo 
                        a qualquer momento através do e-mail{' '}
                        <a href="mailto:contato@pharosnegocios.com.br" className="underline">
                          contato@pharosnegocios.com.br
                        </a>. 
                        A revogação não afeta a licitude do tratamento realizado anteriormente.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 5. Cookies */}
              <section id="cookies" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Cookie className="h-7 w-7 text-pharos-blue-600" />
                  5. Cookies e Tecnologias de Rastreamento
                </h2>
                
                <p>
                  Utilizamos cookies e tecnologias similares (web beacons, pixels, local storage) para melhorar 
                  sua experiência, analisar o uso do site e personalizar conteúdo e anúncios.
                </p>

                <h3>5.1. Tipos de Cookies Utilizados</h3>

                <div className="not-prose space-y-3 my-6">
                  {[
                    {
                      tipo: 'Cookies Essenciais (Necessários)',
                      descricao: 'Indispensáveis para o funcionamento básico do site. Não podem ser desativados.',
                      exemplos: 'Sessão de usuário, segurança, balanceamento de carga',
                      duracao: 'Sessão ou até 1 ano'
                    },
                    {
                      tipo: 'Cookies de Desempenho e Analytics',
                      descricao: 'Coletam informações sobre como você usa o site para melhorar seu funcionamento.',
                      exemplos: 'Google Analytics, métricas de páginas visitadas, tempo de permanência',
                      duracao: 'Até 2 anos'
                    },
                    {
                      tipo: 'Cookies de Funcionalidade',
                      descricao: 'Lembram suas preferências para proporcionar experiência personalizada.',
                      exemplos: 'Filtros salvos, favoritos, idioma, tema',
                      duracao: 'Até 1 ano'
                    },
                    {
                      tipo: 'Cookies de Marketing e Publicidade',
                      descricao: 'Rastreiam sua navegação para exibir anúncios relevantes e medir campanhas.',
                      exemplos: 'Facebook Pixel, Google Ads, remarketing, UTMs',
                      duracao: 'Até 1 ano'
                    },
                  ].map((cookie, idx) => (
                    <div key={idx} className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                      <h4 className="font-semibold text-neutral-900 text-base mb-2">{cookie.tipo}</h4>
                      <p className="text-sm text-neutral-700 mb-2">{cookie.descricao}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-neutral-600">
                        <span><strong>Exemplos:</strong> {cookie.exemplos}</span>
                        <span><strong>Duração:</strong> {cookie.duracao}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <h3>5.2. Como Gerenciar Cookies</h3>
                <p>
                  Você pode gerenciar ou desativar cookies através das configurações do seu navegador. Note que 
                  desativar cookies essenciais pode afetar o funcionamento do site.
                </p>
                <ul>
                  <li><strong>Chrome:</strong> Configurações → Privacidade e segurança → Cookies</li>
                  <li><strong>Firefox:</strong> Opções → Privacidade e segurança → Cookies e dados de sites</li>
                  <li><strong>Safari:</strong> Preferências → Privacidade → Gerenciar dados de sites</li>
                  <li><strong>Edge:</strong> Configurações → Privacidade, pesquisa e serviços → Cookies</li>
                </ul>

                <p>
                  Para mais informações sobre cookies, visite{' '}
                  <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer">
                    www.allaboutcookies.org
                  </a>.
                </p>
              </section>

              {/* 6. Compartilhamento */}
              <section id="compartilhamento" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Users className="h-7 w-7 text-pharos-blue-600" />
                  6. Compartilhamento de Dados Pessoais
                </h2>
                
                <p>
                  Podemos compartilhar seus dados pessoais com terceiros nas seguintes situações, sempre com 
                  salvaguardas adequadas:
                </p>

                <h3>6.1. Prestadores de Serviços</h3>
                <ul>
                  <li><strong>Hospedagem e infraestrutura:</strong> servidores, CDN, armazenamento em nuvem</li>
                  <li><strong>Analytics e métricas:</strong> Google Analytics, ferramentas de monitoramento</li>
                  <li><strong>Marketing e comunicação:</strong> plataformas de e-mail marketing, CRM, automação</li>
                  <li><strong>Publicidade:</strong> Google Ads, Facebook Ads, redes de anúncios</li>
                  <li><strong>Pagamentos:</strong> processadores de pagamento (quando aplicável)</li>
                  <li><strong>Mensageria:</strong> provedores de WhatsApp Business, SMS</li>
                </ul>

                <h3>6.2. Parceiros Comerciais</h3>
                <ul>
                  <li><strong>Corretores parceiros:</strong> para atendimento especializado em regiões específicas</li>
                  <li><strong>Instituições financeiras:</strong> para facilitar financiamento imobiliário</li>
                  <li><strong>Empresas de avaliação:</strong> para avaliação técnica de imóveis</li>
                </ul>

                <h3>6.3. Autoridades e Obrigações Legais</h3>
                <ul>
                  <li><strong>Órgãos reguladores:</strong> CRECI, Receita Federal, quando legalmente exigido</li>
                  <li><strong>Autoridades judiciais:</strong> mediante ordem judicial ou solicitação legal</li>
                  <li><strong>Autoridade Nacional de Proteção de Dados (ANPD):</strong> em caso de investigações</li>
                </ul>

                <div className="not-prose bg-blue-50 border border-blue-200 rounded-lg p-5 my-6">
                  <div className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Garantias de Segurança</h4>
                      <p className="text-sm text-blue-800">
                        Todos os terceiros que têm acesso aos seus dados são contratualmente obrigados a manter 
                        medidas de segurança adequadas e usar os dados apenas para os fins autorizados. 
                        <strong> Não vendemos, alugamos ou comercializamos seus dados pessoais.</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 7. Segurança */}
              <section id="seguranca" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Lock className="h-7 w-7 text-pharos-blue-600" />
                  7. Segurança dos Dados
                </h2>
                
                <p>
                  Implementamos medidas técnicas e organizacionais apropriadas para proteger seus dados pessoais 
                  contra acesso não autorizado, alteração, divulgação ou destruição.
                </p>

                <h3>7.1. Medidas Técnicas</h3>
                <ul>
                  <li><strong>Criptografia:</strong> uso de HTTPS/SSL/TLS para transmissão segura de dados</li>
                  <li><strong>Controles de acesso:</strong> autenticação, autorização e privilégios mínimos</li>
                  <li><strong>Firewalls e monitoramento:</strong> proteção contra invasões e ataques cibernéticos</li>
                  <li><strong>Backups seguros:</strong> cópias de segurança regulares e criptografadas</li>
                  <li><strong>Anonimização e pseudonimização:</strong> quando possível e adequado</li>
          </ul>

                <h3>7.2. Medidas Organizacionais</h3>
                <ul>
                  <li><strong>Treinamento:</strong> capacitação regular da equipe sobre proteção de dados</li>
                  <li><strong>Políticas internas:</strong> procedimentos de segurança e privacidade documentados</li>
                  <li><strong>Contratos:</strong> cláusulas de proteção de dados com fornecedores</li>
                  <li><strong>Auditoria:</strong> revisões periódicas de segurança e conformidade</li>
                  <li><strong>Resposta a incidentes:</strong> plano de ação para violações de dados</li>
          </ul>

                <div className="not-prose bg-amber-50 border border-amber-200 rounded-lg p-5 my-6">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-2">Notificação de Violação de Dados</h4>
                      <p className="text-sm text-amber-800">
                        Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos seus 
                        direitos, notificaremos você e a ANPD em prazo razoável, conforme determinado pela LGPD, 
                        informando as medidas tomadas para mitigar os efeitos.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 8. Retenção */}
              <section id="retencao" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Calendar className="h-7 w-7 text-pharos-blue-600" />
                  8. Retenção e Eliminação de Dados
                </h2>
                
                <p>
                  Mantemos seus dados pessoais apenas pelo tempo necessário para cumprir as finalidades para as 
                  quais foram coletados, respeitando prazos legais e regulatórios.
                </p>

                <h3>8.1. Critérios de Retenção</h3>
                <ul>
                  <li><strong>Dados de atendimento:</strong> mantidos durante a relação comercial e por até 5 anos 
                    após o último contato, para histórico e eventual defesa de direitos</li>
                  <li><strong>Dados de marketing:</strong> mantidos até a revogação do consentimento ou 2 anos de 
                    inatividade, o que ocorrer primeiro</li>
                  <li><strong>Dados de navegação:</strong> logs mantidos por até 6 meses para segurança e analytics</li>
                  <li><strong>Documentos contratuais:</strong> mantidos por até 10 anos após o término do contrato, 
                    conforme Código Civil (prescrição)</li>
                  <li><strong>Dados fiscais:</strong> mantidos por 5 anos, conforme legislação tributária</li>
                </ul>

                <h3>8.2. Eliminação Segura</h3>
                <p>
                  Após o término do prazo de retenção, os dados são eliminados de forma segura e irreversível, 
                  ou anonimizados de forma que não possam ser relacionados a você. Dados podem ser mantidos em 
                  formato anonimizado para fins estatísticos indefinidamente.
                </p>
              </section>

              {/* 9. Direitos */}
              <section id="direitos" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Shield className="h-7 w-7 text-pharos-blue-600" />
                  9. Seus Direitos como Titular de Dados
                </h2>
                
                <p>
                  Conforme a LGPD (Art. 18), você possui os seguintes direitos em relação aos seus dados pessoais:
                </p>

                <div className="not-prose grid md:grid-cols-2 gap-4 my-6">
                  {[
                    {
                      direito: 'Confirmação e Acesso',
                      descricao: 'Confirmar que tratamos seus dados e acessar uma cópia deles'
                    },
                    {
                      direito: 'Correção',
                      descricao: 'Corrigir dados incompletos, inexatos ou desatualizados'
                    },
                    {
                      direito: 'Anonimização, Bloqueio ou Eliminação',
                      descricao: 'Solicitar anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade'
                    },
                    {
                      direito: 'Portabilidade',
                      descricao: 'Receber seus dados em formato estruturado e interoperável'
                    },
                    {
                      direito: 'Informação sobre Compartilhamento',
                      descricao: 'Saber com quais entidades públicas e privadas compartilhamos seus dados'
                    },
                    {
                      direito: 'Informação sobre Não Consentimento',
                      descricao: 'Ser informado sobre as consequências de não fornecer consentimento'
                    },
                    {
                      direito: 'Revogação do Consentimento',
                      descricao: 'Revogar o consentimento a qualquer momento'
                    },
                    {
                      direito: 'Oposição',
                      descricao: 'Opor-se a tratamentos baseados em legítimo interesse'
                    },
                    {
                      direito: 'Revisão de Decisões Automatizadas',
                      descricao: 'Solicitar revisão humana de decisões tomadas unicamente com base em tratamento automatizado'
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-pharos-blue-50 to-white border border-pharos-blue-100 rounded-lg p-4">
                      <h4 className="font-semibold text-pharos-blue-900 text-base mb-2">{item.direito}</h4>
                      <p className="text-sm text-neutral-700">{item.descricao}</p>
                    </div>
                  ))}
                </div>

                <h3>9.1. Como Exercer Seus Direitos</h3>
                <p>
                  Para exercer qualquer um desses direitos, envie uma solicitação para nosso Encarregado de 
                  Proteção de Dados através do e-mail{' '}
                  <a href="mailto:contato@pharosnegocios.com.br">contato@pharosnegocios.com.br</a>, informando:
                </p>
                <ul>
                  <li>Nome completo e dados de contato</li>
                  <li>Direito(s) que deseja exercer</li>
                  <li>Descrição clara da solicitação</li>
                  <li>Documentos de identificação (quando necessário para verificação)</li>
                </ul>

                <h3>9.2. Prazo de Resposta</h3>
                <p>
                  Responderemos sua solicitação <strong>em até 15 (quinze) dias corridos</strong>, conforme 
                  estabelecido pela LGPD. Em casos excepcionais de complexidade ou volume, o prazo pode ser 
                  prorrogado por mais 15 dias, mediante justificativa.
                </p>

                <h3>9.3. Limitações aos Direitos</h3>
                <p>
                  Em determinadas situações, podemos não atender total ou parcialmente sua solicitação quando:
                </p>
                <ul>
                  <li>Houver obrigação legal ou regulatória de manter os dados</li>
                  <li>For necessário para o exercício regular de direitos em processo judicial, administrativo ou arbitral</li>
                  <li>For necessário para proteção da vida ou incolumidade física</li>
                  <li>For necessário para cumprimento de obrigação legal ou regulatória</li>
          </ul>
          <p>
                  Nesses casos, explicaremos os motivos da limitação e as alternativas disponíveis.
                </p>
              </section>

              {/* 10. Menores */}
              <section id="menores" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <AlertCircle className="h-7 w-7 text-pharos-blue-600" />
                  10. Crianças e Adolescentes
                </h2>
                
                <p>
                  Nossos serviços são destinados exclusivamente a <strong>pessoas maiores de 18 anos</strong>. 
                  Não coletamos intencionalmente dados pessoais de crianças ou adolescentes menores de 18 anos 
                  sem o consentimento específico de ao menos um dos pais ou responsável legal.
                </p>
                
                <p>
                  Se tomarmos conhecimento de que coletamos dados de menores sem a devida autorização, tomaremos 
                  medidas para eliminar essas informações o mais rápido possível.
                </p>

                <p>
                  Caso você seja pai, mãe ou responsável legal e acredite que seu filho forneceu dados pessoais 
                  sem autorização, entre em contato conosco imediatamente através do e-mail{' '}
                  <a href="mailto:contato@pharosnegocios.com.br">contato@pharosnegocios.com.br</a>.
                </p>
              </section>

              {/* 11. Transferência Internacional */}
              <section id="transferencia" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Globe className="h-7 w-7 text-pharos-blue-600" />
                  11. Transferência Internacional de Dados
                </h2>
                
                <p>
                  Alguns dos prestadores de serviços que utilizamos (como provedores de hospedagem em nuvem, 
                  ferramentas de analytics e plataformas de marketing) podem estar localizados fora do Brasil 
                  ou armazenar dados em servidores internacionais.
                </p>

                <h3>11.1. Países com Nível de Proteção Adequado</h3>
                <p>
                  Priorizamos a transferência de dados para países ou organismos internacionais que proporcionem 
                  grau de proteção de dados adequado ao previsto na LGPD, conforme avaliação da ANPD.
                </p>

                <h3>11.2. Garantias e Salvaguardas</h3>
                <p>
                  Quando a transferência for para países sem nível adequado de proteção, adotamos salvaguardas 
                  como:
                </p>
                <ul>
                  <li><strong>Cláusulas contratuais padrão:</strong> contratos com cláusulas específicas de proteção de dados</li>
                  <li><strong>Certificações:</strong> prestadores certificados em padrões internacionais (ISO 27001, SOC 2, etc.)</li>
                  <li><strong>Consentimento específico:</strong> quando necessário, solicitamos consentimento explícito</li>
                  <li><strong>Normas corporativas globais:</strong> políticas de privacidade de grupos empresariais multinacionais</li>
                </ul>

                <h3>11.3. Principais Destinos</h3>
                <p>
                  Atualmente, alguns dados podem ser transferidos para:
                </p>
                <ul>
                  <li><strong>Estados Unidos:</strong> Google (Analytics, Ads), Meta/Facebook (Ads, Pixel)</li>
                  <li><strong>União Europeia:</strong> provedores de hospedagem e infraestrutura em nuvem</li>
                </ul>
              </section>

              {/* 12. Atualizações */}
              <section id="atualizacoes" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Eye className="h-7 w-7 text-pharos-blue-600" />
                  12. Atualizações desta Política
                </h2>
                
                <p>
                  Esta Política de Privacidade pode ser atualizada periodicamente para refletir:
                </p>
                <ul>
                  <li>Mudanças nas nossas práticas de tratamento de dados</li>
                  <li>Alterações na legislação aplicável</li>
                  <li>Implementação de novas tecnologias ou serviços</li>
                  <li>Recomendações de autoridades reguladoras</li>
                  <li>Melhorias em transparência e clareza</li>
                </ul>

                <p>
                  Sempre que houver alterações materiais, <strong>notificaremos você</strong> através de:
                </p>
                <ul>
                  <li>Aviso destacado no site</li>
                  <li>E-mail para o endereço cadastrado (quando aplicável)</li>
                  <li>Comunicação via WhatsApp (para alterações significativas)</li>
                </ul>

                <p>
                  Recomendamos que você revise esta política periodicamente. A versão mais atualizada estará 
                  sempre disponível nesta página, com a data de vigência indicada no início.
                </p>

                <div className="not-prose bg-neutral-100 border border-neutral-300 rounded-lg p-5 my-6">
                  <p className="text-sm text-neutral-700">
                    <strong>Última atualização:</strong> {formatted}
                  </p>
                  <p className="text-sm text-neutral-700 mt-2">
                    <strong>Versão:</strong> 2.0
                  </p>
                </div>
              </section>

              {/* 13. Contato e Reclamações */}
              <section id="contato" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Mail className="h-7 w-7 text-pharos-blue-600" />
                  13. Contato e Reclamações
                </h2>
                
                <h3>13.1. Canal de Atendimento</h3>
                <p>
                  Para dúvidas, solicitações ou reclamações relacionadas ao tratamento de dados pessoais, 
                  entre em contato com nosso Encarregado de Proteção de Dados:
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
                      <Phone className="h-5 w-5 text-pharos-blue-600 shrink-0 mt-0.5" />
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
                    <div className="flex items-start gap-3">
                      <Building className="h-5 w-5 text-pharos-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-pharos-blue-900">Endereço</p>
                        <p className="text-sm text-pharos-blue-700">
                          Rua 2300, 575, Sala 04<br />
                          Centro, Balneário Camboriú/SC<br />
                          CEP 88330-428
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <h3>13.2. Reclamações à Autoridade Nacional de Proteção de Dados (ANPD)</h3>
                <p>
                  Sem prejuízo de qualquer recurso administrativo ou judicial, você tem o direito de apresentar 
                  reclamação diretamente à ANPD se considerar que o tratamento de seus dados pessoais viola a LGPD.
                </p>

                <div className="not-prose bg-neutral-50 border border-neutral-200 rounded-lg p-5 my-6">
                  <h4 className="font-semibold text-neutral-900 mb-3">Dados de Contato da ANPD</h4>
                  <ul className="space-y-2 text-sm text-neutral-700">
                    <li><strong>Site:</strong>{' '}
                      <a 
                        href="https://www.gov.br/anpd" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-pharos-blue-600 hover:underline"
                      >
                        www.gov.br/anpd
                      </a>
                    </li>
                    <li><strong>Canal de Atendimento:</strong> Disponível no site oficial</li>
                    <li><strong>Endereço:</strong> Setor Comercial Sul, Quadra 09, Bloco C, Torre C, Sala 601, Brasília/DF, CEP 70308-200</li>
                  </ul>
                </div>

                <h3>13.3. Outras Páginas Importantes</h3>
                <p>Para mais informações sobre a Pharos Negócios Imobiliários:</p>
                <ul>
                  <li>
                    <Link href="/contato">Página de Contato</Link> - Entre em contato conosco
                  </li>
                  <li>
                    <Link href="/sobre">Sobre a Pharos</Link> - Conheça nossa história e equipe
                  </li>
                  <li>
                    <Link href="/imoveis">Imóveis</Link> - Explore nosso portfólio
                  </li>
                </ul>
              </section>

              {/* Footer da Política */}
              <div className="not-prose mt-16 pt-8 border-t border-neutral-200">
                <div className="bg-gradient-to-br from-pharos-blue-50 to-pharos-gold-50 rounded-xl p-8 text-center">
                  <Shield className="h-12 w-12 text-pharos-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">
                    Seu direito à privacidade é nossa prioridade
                  </h3>
                  <p className="text-neutral-700 mb-6 max-w-2xl mx-auto">
                    Estamos comprometidos em proteger seus dados pessoais e garantir transparência total sobre 
                    como eles são tratados. Se tiver qualquer dúvida, estamos à disposição.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <a
                      href="mailto:contato@pharosnegocios.com.br"
                      className="inline-flex items-center gap-2 bg-pharos-blue-600 hover:bg-pharos-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      <Mail className="h-5 w-5" />
                      Entrar em Contato
                    </a>
            <a
              href="https://wa.me/5547991878070"
              target="_blank"
              rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
                      <Phone className="h-5 w-5" />
              WhatsApp
            </a>
                  </div>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}


