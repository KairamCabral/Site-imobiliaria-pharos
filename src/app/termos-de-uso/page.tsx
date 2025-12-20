'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  FileText, 
  Building, 
  Scale, 
  UserCheck, 
  AlertCircle,
  CheckCircle,
  Mail,
  Phone,
  Calendar,
  Eye,
  ShieldAlert,
  Ban,
  Users,
  Crown,
  BookOpen,
  Gavel
} from 'lucide-react';

export default function TermosDeUsoPage() {
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
    { id: 'definicoes', title: 'Definições', icon: BookOpen },
    { id: 'aceitacao', title: 'Aceitação dos Termos', icon: UserCheck },
    { id: 'servicos', title: 'Serviços Oferecidos', icon: Building },
    { id: 'cadastro', title: 'Cadastro e Conta', icon: Users },
    { id: 'uso-permitido', title: 'Uso Permitido', icon: CheckCircle },
    { id: 'uso-proibido', title: 'Uso Proibido', icon: Ban },
    { id: 'propriedade-intelectual', title: 'Propriedade Intelectual', icon: Crown },
    { id: 'anuncios', title: 'Anúncios de Imóveis', icon: Building },
    { id: 'responsabilidades', title: 'Responsabilidades', icon: Scale },
    { id: 'limitacao', title: 'Limitação de Responsabilidade', icon: ShieldAlert },
    { id: 'legislacao', title: 'Legislação Aplicável', icon: Gavel },
    { id: 'alteracoes', title: 'Alterações dos Termos', icon: Eye },
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
              <Scale className="h-4 w-4" />
              Termos Legais
            </div>
            <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl mb-6 text-white drop-shadow-lg">
              Termos de Uso
            </h1>
            <p className="text-lg text-white/95 leading-relaxed mb-4 drop-shadow">
              Bem-vindo à <strong>Pharos Negócios Imobiliários</strong>. Estes Termos de Uso estabelecem as 
              condições para utilização do nosso site, serviços e plataforma imobiliária. Ao acessar ou usar 
              nossos serviços, você concorda em cumprir estes termos e todas as leis aplicáveis.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Vigente desde {formatted}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Atualizado</span>
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
                  Dúvidas sobre os Termos?
                </h4>
                <p className="text-sm text-pharos-blue-700 mb-4">
                  Nossa equipe está pronta para esclarecer qualquer questão
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

              {/* Links Relacionados */}
              <div className="mt-6 p-6 rounded-xl bg-neutral-50 border border-neutral-200">
                <h4 className="font-semibold text-neutral-900 mb-3">Documentos Relacionados</h4>
                <div className="space-y-2 text-sm">
                  <Link href="/politica-privacidade" className="block text-pharos-blue-600 hover:underline">
                    → Política de Privacidade
                  </Link>
                  <Link href="/politica-cookies" className="block text-pharos-blue-600 hover:underline">
                    → Política de Cookies
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
                  <FileText className="h-7 w-7 text-pharos-blue-600" />
                  1. Introdução
                </h2>
                <p>
                  Bem-vindo ao site da <strong>Pharos Negócios Imobiliários</strong>. Estes Termos de Uso 
                  regulam o acesso e a utilização de todos os serviços, conteúdos e funcionalidades disponíveis 
                  em nosso site e plataforma imobiliária.
                </p>
                <p>
                  Ao acessar ou utilizar nossos serviços, você declara que leu, compreendeu e concorda em 
                  cumprir integralmente estes Termos de Uso, nossa{' '}
                  <Link href="/politica-privacidade">Política de Privacidade</Link> e todas as leis e 
                  regulamentos aplicáveis.
                </p>
                <div className="not-prose bg-amber-50 border border-amber-200 rounded-lg p-5 my-6">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-2">Importante</h4>
                      <p className="text-sm text-amber-800">
                        Se você não concordar com qualquer parte destes termos, <strong>não utilize nossos 
                        serviços</strong>. O uso continuado após modificações dos termos constitui aceitação 
                        das alterações.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. Definições */}
              <section id="definicoes" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <BookOpen className="h-7 w-7 text-pharos-blue-600" />
                  2. Definições
                </h2>
                <p>Para os fins destes Termos de Uso, consideram-se as seguintes definições:</p>
                
                <ul>
                  <li><strong>"Pharos" ou "Nós":</strong> refere-se à Pharos Negócios Imobiliários, 
                    CNPJ 51.040.966/0001-93, CRECI 40107</li>
                  <li><strong>"Site":</strong> o site pharosnegocios.com.br e todas as suas páginas, 
                    subdomínios e funcionalidades</li>
                  <li><strong>"Usuário" ou "Você":</strong> qualquer pessoa física ou jurídica que acessa 
                    ou utiliza nossos serviços</li>
                  <li><strong>"Serviços":</strong> todos os serviços imobiliários oferecidos pela Pharos, 
                    incluindo intermediação, consultoria, avaliação e outros</li>
                  <li><strong>"Conteúdo":</strong> textos, imagens, vídeos, gráficos, logotipos e demais 
                    materiais disponibilizados no Site</li>
                  <li><strong>"Imóvel":</strong> qualquer bem imóvel (apartamento, casa, terreno, sala comercial, 
                    etc.) anunciado ou intermediado pela Pharos</li>
                  <li><strong>"Anunciante":</strong> proprietário ou representante legal que anuncia imóvel 
                    através da Pharos</li>
                </ul>
              </section>

              {/* 3. Aceitação dos Termos */}
              <section id="aceitacao" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <UserCheck className="h-7 w-7 text-pharos-blue-600" />
                  3. Aceitação dos Termos
                </h2>
                <p>
                  A aceitação destes Termos de Uso é <strong>indispensável</strong> para a utilização dos 
                  serviços da Pharos. Você concorda com estes termos ao:
                </p>
                <ul>
                  <li>Acessar ou navegar pelo Site</li>
                  <li>Criar uma conta ou cadastro</li>
                  <li>Preencher formulários de contato</li>
                  <li>Solicitar informações sobre imóveis</li>
                  <li>Anunciar imóveis através da plataforma</li>
                  <li>Contratar qualquer um dos nossos serviços</li>
                </ul>
                <p>
                  Caso você esteja acessando em nome de uma pessoa jurídica, declara ter autoridade legal 
                  para vincular essa entidade a estes termos.
                </p>
              </section>

              {/* 4. Serviços Oferecidos */}
              <section id="servicos" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Building className="h-7 w-7 text-pharos-blue-600" />
                  4. Serviços Oferecidos
                </h2>
                <p>
                  A Pharos Negócios Imobiliários oferece os seguintes serviços através de sua plataforma:
                </p>

                <h3>4.1. Intermediação Imobiliária</h3>
                <ul>
                  <li>Compra, venda e locação de imóveis residenciais e comerciais</li>
                  <li>Apresentação de imóveis compatíveis com o perfil do cliente</li>
                  <li>Negociação entre compradores e vendedores</li>
                  <li>Acompanhamento de documentação e processos</li>
                </ul>

                <h3>4.2. Consultoria Imobiliária</h3>
                <ul>
                  <li>Avaliação de imóveis</li>
                  <li>Análise de mercado e precificação</li>
                  <li>Orientação sobre investimentos imobiliários</li>
                  <li>Assessoria técnica e jurídica (através de parceiros)</li>
                </ul>

                <h3>4.3. Plataforma Digital</h3>
                <ul>
                  <li>Busca e filtros avançados de imóveis</li>
                  <li>Visualização de fotos, vídeos e informações detalhadas</li>
                  <li>Agendamento de visitas online</li>
                  <li>Sistema de favoritos e comparação de imóveis</li>
                  <li>Área de cadastro e gestão de anúncios (para proprietários)</li>
                </ul>

                <div className="not-prose bg-blue-50 border border-blue-200 rounded-lg p-5 my-6">
                  <div className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Disponibilidade dos Serviços</h4>
                      <p className="text-sm text-blue-800">
                        Envidamos esforços para manter nossos serviços disponíveis 24/7, mas podem ocorrer 
                        interrupções temporárias para manutenção, atualizações ou por motivos técnicos. 
                        Não garantimos disponibilidade ininterrupta.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 5. Cadastro e Conta */}
              <section id="cadastro" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Users className="h-7 w-7 text-pharos-blue-600" />
                  5. Cadastro e Conta de Usuário
                </h2>
                <p>
                  Alguns serviços podem exigir cadastro e criação de conta. Ao criar uma conta, você concorda em:
                </p>

                <h3>5.1. Informações Verdadeiras</h3>
                <ul>
                  <li>Fornecer informações precisas, completas e atualizadas</li>
                  <li>Manter seus dados cadastrais sempre atualizados</li>
                  <li>Não se passar por outra pessoa ou entidade</li>
                  <li>Não criar múltiplas contas para a mesma pessoa/entidade</li>
                </ul>

                <h3>5.2. Segurança da Conta</h3>
                <ul>
                  <li>Manter a confidencialidade de sua senha</li>
                  <li>Não compartilhar credenciais de acesso com terceiros</li>
                  <li>Notificar imediatamente sobre qualquer uso não autorizado</li>
                  <li>Ser responsável por todas as atividades realizadas em sua conta</li>
                </ul>

                <h3>5.3. Direito de Recusa</h3>
                <p>
                  A Pharos reserva-se o direito de recusar, suspender ou cancelar cadastros a seu exclusivo 
                  critério, especialmente em casos de violação destes Termos ou suspeita de fraude.
                </p>
              </section>

              {/* 6. Uso Permitido */}
              <section id="uso-permitido" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <CheckCircle className="h-7 w-7 text-pharos-blue-600" />
                  6. Uso Permitido
                </h2>
                <p>
                  Você está autorizado a utilizar nosso Site e serviços para os seguintes fins legítimos:
                </p>
                <ul>
                  <li>Buscar imóveis para compra, venda ou locação</li>
                  <li>Solicitar informações e esclarecer dúvidas</li>
                  <li>Agendar visitas e interagir com corretores</li>
                  <li>Anunciar imóveis próprios ou de terceiros com autorização</li>
                  <li>Contratar serviços de consultoria imobiliária</li>
                  <li>Comparar imóveis e salvar favoritos</li>
                  <li>Compartilhar anúncios em redes sociais</li>
                  <li>Acessar conteúdo informativo e educacional</li>
                </ul>
              </section>

              {/* 7. Uso Proibido */}
              <section id="uso-proibido" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Ban className="h-7 w-7 text-pharos-blue-600" />
                  7. Uso Proibido
                </h2>
                <p>
                  É <strong>expressamente proibido</strong> utilizar nosso Site ou serviços para:
                </p>

                <h3>7.1. Atividades Ilegais</h3>
                <ul>
                  <li>Violar leis federais, estaduais ou municipais</li>
                  <li>Praticar ou facilitar atividades fraudulentas</li>
                  <li>Anunciar imóveis sem autorização do proprietário</li>
                  <li>Fornecer informações falsas ou enganosas</li>
                  <li>Lavagem de dinheiro ou financiamento de atividades ilícitas</li>
                </ul>

                <h3>7.2. Atividades Técnicas Maliciosas</h3>
                <ul>
                  <li>Tentar acessar áreas restritas ou sistemas sem autorização</li>
                  <li>Introduzir vírus, malware ou códigos maliciosos</li>
                  <li>Fazer engenharia reversa ou descompilar o Site</li>
                  <li>Realizar web scraping ou coleta automatizada de dados</li>
                  <li>Sobrecarregar servidores (ataques DDoS ou similares)</li>
                  <li>Burlar medidas de segurança ou autenticação</li>
                </ul>

                <h3>7.3. Conduta Inadequada</h3>
                <ul>
                  <li>Assediar, ameaçar ou intimidar outros usuários ou funcionários</li>
                  <li>Publicar conteúdo ofensivo, discriminatório ou difamatório</li>
                  <li>Enviar spam ou mensagens não solicitadas</li>
                  <li>Usar o Site para fins não relacionados ao mercado imobiliário</li>
                  <li>Copiar ou reproduzir conteúdo sem autorização</li>
                </ul>

                <div className="not-prose bg-red-50 border border-red-200 rounded-lg p-5 my-6">
                  <div className="flex gap-3">
                    <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-900 mb-2">Consequências de Violação</h4>
                      <p className="text-sm text-red-800">
                        A violação destas proibições pode resultar em: <strong>(a)</strong> suspensão ou 
                        cancelamento imediato da conta; <strong>(b)</strong> bloqueio de acesso ao Site; 
                        <strong>(c)</strong> responsabilização civil e criminal; <strong>(d)</strong> 
                        comunicação às autoridades competentes.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 8. Propriedade Intelectual */}
              <section id="propriedade-intelectual" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Crown className="h-7 w-7 text-pharos-blue-600" />
                  8. Propriedade Intelectual
                </h2>
                
                <h3>8.1. Direitos da Pharos</h3>
                <p>
                  Todo o conteúdo do Site, incluindo mas não se limitando a textos, gráficos, logotipos, 
                  ícones, imagens, vídeos, áudio, software e código-fonte, é de <strong>propriedade exclusiva</strong> da 
                  Pharos Negócios Imobiliários ou de seus licenciadores, protegido pelas leis de direitos 
                  autorais, marcas registradas e propriedade intelectual brasileiras e internacionais.
                </p>

                <h3>8.2. Marca Registrada</h3>
                <p>
                  "Pharos", o logotipo da Pharos e outras marcas exibidas no Site são marcas registradas ou 
                  em processo de registro da Pharos Negócios Imobiliários. É proibido usar estas marcas 
                  sem autorização prévia por escrito.
                </p>

                <h3>8.3. Licença de Uso Limitada</h3>
                <p>
                  Concedemos a você uma licença limitada, não exclusiva, não transferível e revogável para 
                  acessar e usar o Site para fins pessoais e não comerciais. Esta licença não inclui:
                </p>
                <ul>
                  <li>Modificação ou cópia de materiais</li>
                  <li>Uso de materiais para fins comerciais</li>
                  <li>Remoção de avisos de direitos autorais ou propriedade</li>
                  <li>Transferência de materiais para outra pessoa</li>
                  <li>Reprodução, distribuição ou criação de obras derivadas</li>
                </ul>

                <h3>8.4. Conteúdo de Terceiros</h3>
                <p>
                  Fotos e informações de imóveis fornecidas por proprietários permanecem de propriedade dos 
                  respectivos autores. Ao submeter conteúdo, você nos concede licença mundial, não exclusiva, 
                  livre de royalties para usar, reproduzir e exibir o material nos limites necessários para 
                  prestar nossos serviços.
                </p>
              </section>

              {/* 9. Anúncios de Imóveis */}
              <section id="anuncios" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Building className="h-7 w-7 text-pharos-blue-600" />
                  9. Anúncios de Imóveis
                </h2>

                <h3>9.1. Responsabilidade do Anunciante</h3>
                <p>
                  Ao anunciar um imóvel através da Pharos, você declara e garante que:
                </p>
                <ul>
                  <li>É o proprietário legítimo ou representante autorizado do imóvel</li>
                  <li>Todas as informações fornecidas são verdadeiras e precisas</li>
                  <li>Possui todos os direitos sobre fotos e materiais enviados</li>
                  <li>O imóvel está regular perante órgãos públicos</li>
                  <li>Não há impedimentos legais para venda ou locação</li>
                  <li>Os valores e condições informados são reais</li>
                </ul>

                <h3>9.2. Moderação de Anúncios</h3>
                <p>
                  A Pharos reserva-se o direito de:
                </p>
                <ul>
                  <li>Revisar e aprovar anúncios antes da publicação</li>
                  <li>Editar informações para padronização e clareza</li>
                  <li>Solicitar documentação comprobatória</li>
                  <li>Recusar ou remover anúncios que violem estes Termos</li>
                  <li>Suspender anunciantes em caso de irregularidades</li>
                </ul>

                <h3>9.3. Precisão das Informações</h3>
                <p>
                  Embora a Pharos realize esforços razoáveis para verificar informações de imóveis, 
                  <strong> não garantimos a precisão, completude ou atualidade</strong> de todas as 
                  informações. Compradores e locatários devem realizar sua própria due diligence e 
                  verificação independente.
                </p>
              </section>

              {/* 10. Responsabilidades */}
              <section id="responsabilidades" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Scale className="h-7 w-7 text-pharos-blue-600" />
                  10. Responsabilidades das Partes
                </h2>

                <h3>10.1. Responsabilidades da Pharos</h3>
                <p>A Pharos compromete-se a:</p>
                <ul>
                  <li>Prestar serviços de intermediação imobiliária com profissionalismo</li>
                  <li>Manter o Site funcionando de forma razoável</li>
                  <li>Proteger dados pessoais conforme a LGPD</li>
                  <li>Atuar de acordo com o Código de Ética do CRECI</li>
                  <li>Fornecer informações claras sobre comissões e custos</li>
                </ul>

                <h3>10.2. Responsabilidades do Usuário</h3>
                <p>O usuário é responsável por:</p>
                <ul>
                  <li>Fornecer informações verdadeiras e atualizadas</li>
                  <li>Cumprir todos os termos e condições estabelecidos</li>
                  <li>Manter a confidencialidade de sua conta</li>
                  <li>Arcar com custos de acesso à internet e dispositivos</li>
                  <li>Realizar due diligence antes de transações imobiliárias</li>
                  <li>Consultar advogados e contadores quando necessário</li>
                </ul>

                <h3>10.3. Isenção de Responsabilidade</h3>
                <p>A Pharos <strong>NÃO é responsável</strong> por:</p>
                <ul>
                  <li>Vícios ocultos ou problemas estruturais em imóveis</li>
                  <li>Inadimplemento de obrigações contratuais entre comprador e vendedor</li>
                  <li>Decisões de investimento ou prejuízos financeiros</li>
                  <li>Informações imprecisas fornecidas por terceiros</li>
                  <li>Problemas técnicos, interrupções ou perda de dados</li>
                  <li>Conteúdo ou conduta de terceiros no Site</li>
                  <li>Links externos ou sites de terceiros</li>
                </ul>
              </section>

              {/* 11. Limitação de Responsabilidade */}
              <section id="limitacao" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <ShieldAlert className="h-7 w-7 text-pharos-blue-600" />
                  11. Limitação de Responsabilidade
                </h2>
                
                <p>
                  <strong>NA MÁXIMA EXTENSÃO PERMITIDA PELA LEI APLICÁVEL</strong>, a Pharos e seus 
                  diretores, funcionários, parceiros e fornecedores não serão responsáveis por:
                </p>

                <h3>11.1. Danos Indiretos</h3>
                <ul>
                  <li>Danos indiretos, incidentais, especiais ou consequenciais</li>
                  <li>Perda de lucros, receitas ou oportunidades de negócios</li>
                  <li>Perda de dados ou informações</li>
                  <li>Danos morais ou à reputação</li>
                  <li>Custos de aquisição de bens ou serviços substitutos</li>
                </ul>

                <h3>11.2. Limitação de Valor</h3>
                <p>
                  Em qualquer caso, nossa responsabilidade total não excederá o valor da comissão ou 
                  remuneração recebida pela transação específica em questão, ou R$ 1.000,00 (mil reais), 
                  o que for menor.
                </p>

                <h3>11.3. Força Maior</h3>
                <p>
                  Não seremos responsáveis por falhas ou atrasos decorrentes de causas além do nosso 
                  controle razoável, incluindo mas não se limitando a: desastres naturais, pandemias, 
                  atos governamentais, greves, falhas de infraestrutura, ataques cibernéticos ou 
                  interrupções de serviços de terceiros.
                </p>
              </section>

              {/* 12. Legislação Aplicável */}
              <section id="legislacao" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Gavel className="h-7 w-7 text-pharos-blue-600" />
                  12. Legislação Aplicável e Jurisdição
                </h2>
                
                <p>
                  Estes Termos de Uso são regidos e interpretados de acordo com as leis da 
                  <strong> República Federativa do Brasil</strong>, especialmente:
                </p>
                <ul>
                  <li><strong>Lei nº 6.530/1978</strong> - Regulamentação da profissão de Corretor de Imóveis</li>
                  <li><strong>Lei nº 8.078/1990</strong> - Código de Defesa do Consumidor (CDC)</li>
                  <li><strong>Lei nº 10.406/2002</strong> - Código Civil Brasileiro</li>
                  <li><strong>Lei nº 13.709/2018</strong> - Lei Geral de Proteção de Dados (LGPD)</li>
                  <li><strong>Lei nº 12.965/2014</strong> - Marco Civil da Internet</li>
                </ul>

                <h3>12.1. Foro de Eleição</h3>
                <p>
                  As partes elegem o foro da comarca de <strong>Balneário Camboriú/SC</strong> como o único 
                  competente para dirimir quaisquer controvérsias decorrentes destes Termos, com renúncia 
                  expressa a qualquer outro, por mais privilegiado que seja.
                </p>

                <p>
                  Caso qualquer disposição destes Termos seja considerada inválida ou inexequível, tal 
                  disposição será modificada e interpretada para atingir os objetivos de tal disposição 
                  na maior extensão possível sob a lei aplicável, e as disposições remanescentes 
                  continuarão em pleno vigor e efeito.
                </p>
              </section>

              {/* 13. Alterações dos Termos */}
              <section id="alteracoes" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Eye className="h-7 w-7 text-pharos-blue-600" />
                  13. Alterações dos Termos
                </h2>
                
                <p>
                  A Pharos reserva-se o direito de modificar, atualizar ou substituir estes Termos de Uso 
                  a qualquer momento, a seu exclusivo critério, para:
                </p>
                <ul>
                  <li>Refletir mudanças em nossos serviços ou práticas comerciais</li>
                  <li>Adequar-se a alterações legais ou regulatórias</li>
                  <li>Melhorar a clareza ou precisão dos termos</li>
                  <li>Endereçar novos riscos ou questões de segurança</li>
                </ul>

                <h3>13.1. Notificação de Alterações</h3>
                <p>
                  Quando houver alterações materiais, notificaremos os usuários através de:
                </p>
                <ul>
                  <li>Aviso destacado no Site por período mínimo de 30 dias</li>
                  <li>E-mail para usuários cadastrados (quando aplicável)</li>
                  <li>Atualização da data de vigência no topo desta página</li>
                </ul>

                <h3>13.2. Aceitação das Alterações</h3>
                <p>
                  O uso continuado do Site após a publicação de alterações constitui sua aceitação dos 
                  novos termos. Caso não concorde com as modificações, você deve descontinuar o uso de 
                  nossos serviços imediatamente.
                </p>

                <p>
                  Recomendamos que você revise estes Termos periodicamente para estar ciente de quaisquer 
                  atualizações.
                </p>
              </section>

              {/* 14. Contato */}
              <section id="contato" className="scroll-mt-24">
                <h2 className="flex items-center gap-3">
                  <Mail className="h-7 w-7 text-pharos-blue-600" />
                  14. Contato e Atendimento
                </h2>
                
                <p>
                  Para dúvidas, esclarecimentos ou solicitações relacionadas a estes Termos de Uso, 
                  entre em contato conosco:
                </p>

                <div className="not-prose bg-pharos-blue-50 border border-pharos-blue-200 rounded-xl p-6 my-6">
                  <h4 className="font-semibold text-pharos-blue-900 mb-4">Canais de Contato</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Building className="h-5 w-5 text-pharos-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-pharos-blue-900">Pharos Negócios Imobiliários</p>
                        <p className="text-sm text-pharos-blue-700">CNPJ: 51.040.966/0001-93 | CRECI: 40107</p>
                      </div>
                    </div>
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

                <h3>14.1. Horário de Atendimento</h3>
                <p>
                  Nossa equipe está disponível de segunda a sexta-feira, das 9h às 18h, e aos sábados 
                  das 9h às 13h (horário de Brasília). Mensagens recebidas fora deste horário serão 
                  respondidas no próximo dia útil.
                </p>
              </section>

              {/* Footer dos Termos */}
              <div className="not-prose mt-16 pt-8 border-t border-neutral-200">
                <div className="bg-gradient-to-br from-pharos-blue-50 to-pharos-gold-50 rounded-xl p-8 text-center">
                  <Scale className="h-12 w-12 text-pharos-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">
                    Transparência e Confiança
                  </h3>
                  <p className="text-neutral-700 mb-6 max-w-2xl mx-auto">
                    Estes Termos de Uso estabelecem regras claras para garantir uma relação justa e 
                    transparente entre a Pharos e nossos clientes. Estamos à disposição para esclarecer 
                    qualquer dúvida.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <a
                      href="mailto:contato@pharosnegocios.com.br"
                      className="inline-flex items-center gap-2 bg-pharos-blue-600 hover:bg-pharos-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      <Mail className="h-5 w-5" />
                      Entrar em Contato
                    </a>
                    <Link
                      href="/politica-privacidade"
                      className="inline-flex items-center gap-2 bg-white hover:bg-neutral-50 text-pharos-blue-700 border border-pharos-blue-200 px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Política de Privacidade
                    </Link>
                  </div>
                </div>

                <div className="mt-8 text-center text-sm text-neutral-600">
                  <p className="mb-2">
                    <strong>Última atualização:</strong> {formatted} • <strong>Versão:</strong> 1.0
                  </p>
                  <p>
                    Ao utilizar nossos serviços, você concorda com estes Termos de Uso e nossa{' '}
                    <Link href="/politica-privacidade" className="text-pharos-blue-600 hover:underline">
                      Política de Privacidade
                    </Link>.
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

