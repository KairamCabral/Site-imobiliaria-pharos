/**
 * Tipos e interfaces do Vista CRM
 * 
 * Mapeiam a estrutura de dados retornada pela API do Vista
 */

/**
 * Estrutura de imóvel retornada pelo Vista
 */
export interface VistaImovel {
  Codigo: number | string;
  CodigoImovel?: string;
  
  // Classificação
  Categoria: string; // Tipo do imóvel (Apartamento, Casa, Terreno, etc.) - CAMPO OFICIAL
  TipoImovel?: string; // Mantido para retrocompatibilidade
  Finalidade: string;
  Status?: string; // Status de venda (Disponível, Vendido, etc.)
  
  /**
   * Status da Obra no Vista CRM
   * Campo correto: Situacao (não StatusObra)
   * Valores possíveis: "Pré-Lançamento", "Lançamento", "Em Construção", "Pronto"
   * Confirmado pelo suporte Vista em 12/12/2024
   */
  Situacao?: string;   // ✅ Campo correto para Status da Obra
  StatusObra?: string; // ❌ Campo antigo (não funciona na maioria das contas)
  
  // Localização (conforme documentação Vista)
  Endereco?: string;
  Numero?: string;
  Complemento?: string;
  Bairro?: string; // Bairro do imóvel
  Cidade?: string; // Cidade do imóvel
  Estado?: string;
  UF?: string;
  CEP?: string;
  Latitude?: string | number; // Latitude do imóvel (Geolocalização)
  Longitude?: string | number; // Longitude do imóvel (Geolocalização)
  
  // Valores (conforme documentação Vista)
  ValorVenda?: string | number; // Valor de venda do imóvel
  ValorLocacao?: string | number; // Valor de locação do imóvel (aluguel)
  ValorCondominio?: string | number;
  ValorIptu?: string | number; // ✅ Nome correto (I maiúsculo, ptu minúsculo)
  ValorIPTU?: string | number; // Manter para compatibilidade
  
  // Especificações (conforme documentação Vista)
  AreaTotal?: string | number;
  AreaPrivativa?: string | number;
  AreaTerreno?: string | number;
  Dormitorios?: string | number; // Quantidade de dormitórios (campo oficial)
  Dormitorio?: string | number; // Fallback
  Suites?: string | number;
  Suite?: string | number;
  Banheiros?: string | number;
  Banheiro?: string | number;
  Lavabos?: string | number;
  Vagas?: string | number; // Quantidade de vagas de garagem (campo oficial)
  VagasGaragem?: string | number; // Fallback
  Andar?: string | number;
  TotalAndares?: string | number;
  
  // Características
  Mobiliado?: string | boolean;
  AceitaPet?: string | boolean;
  Acessibilidade?: string | boolean;
  Sacada?: string | boolean;
  Varanda?: string | boolean;
  VarandaGourmet?: string | boolean;
  VistaMar?: string | boolean;
  
  // Descrição
  Descricao?: string;
  Observacao?: string;
  Titulo?: string;
  TituloSite?: string;
  
  // Mídia (conforme documentação Vista)
  FotoDestaque?: string; // Foto de Destaque do imóvel
  FotoDestaquePequena?: string; // Thumbnail da Foto de Destaque do imóvel
  FotoCapa?: string; // Fallback (não é oficial)
  fotos?: VistaFoto[]; // minúsculo (formato antigo)
  Foto?: VistaFoto[]; // MAIÚSCULO (formato novo quando solicitado como array)
  
  // Tour Virtual (nome correto conforme /imoveis/listarcampos)
  Tour360?: string; // ✅ Nome correto (não TourVirtual!)
  TourVirtual?: string; // Manter para compatibilidade
  
  // Vídeos (dois formatos disponíveis)
  URLVideo?: string; // URL simples de vídeo
  Video?: VistaVideo[]; // Array aninhado de vídeos
  Videos?: string[]; // Manter para compatibilidade
  
  // Anexos (array aninhado - PDFs, plantas, documentos)
  Anexo?: VistaAnexo[]; // ✅ Nome correto!
  
  // Características e Infraestrutura (conforme documentação Vista)
  // ⚠️ IMPORTANTE: Caracteristicas vem como OBJETO, não array!
  // Exemplo: { "Churrasqueira Carvao": "Sim", "Churrasqueira Gas": "Nao", "Mobiliado": "Sim" }
  Caracteristicas?: Record<string, 'Sim' | 'Nao'> | string[]; // Pode ser objeto ou array (formato antigo)
  InfraEstrutura?: string[]; // Infra-estrutura do condomínio (lista completa)
  
  // Relacionamentos
  Corretor?: VistaCorretor | { Nome?: string }; // Pode vir como objeto ou apenas com Nome
  CorretorNome?: string; // Fallback quando não vem como objeto
  Agencia?: VistaAgencia;
  
  // Datas (conforme documentação Vista)
  DataCadastro?: string;
  DataAtualizacao?: string;
  DataHoraAtualizacao?: string; // Data e Hora da última atualização no imóvel (formato data)
  
  // Extras
  Destaque?: string | boolean;
  DestaqueWeb?: string | boolean;
  SuperDestaque?: string | boolean;
  Exclusivo?: string | boolean;
  Lancamento?: string | boolean;
  ExibirNoSite?: string | boolean;
  ExibirSite?: string | boolean;
  ExibirWeb?: string | boolean;
  PublicarSite?: string | boolean;
  TemPlaca?: string | boolean;
  Placa?: string | boolean;
  
  // Campos dinâmicos
  [key: string]: any;
}

/**
 * Estrutura de foto do Vista
 */
export interface VistaFoto {
  Foto?: string;
  FotoGrande?: string;
  FotoPequena?: string;
  FotoMedia?: string;
  Descricao?: string;
  Titulo?: string;
  Ordem?: number;
  Destaque?: string | boolean;
  Tipo?: string;
}

/**
 * Estrutura de vídeo do Vista (conforme /imoveis/listarcampos)
 */
export interface VistaVideo {
  Codigo?: string; // Código do registro
  VideoCodigo?: string; // Código do vídeo
  Data?: string; // Data do cadastro
  Descricao?: string; // Descrição do vídeo
  DescricaoWeb?: string; // Descrição para web
  Destaque?: string | boolean; // Se é vídeo destaque
  ExibirNoSite?: string | boolean; // Se deve exibir no site
  ExibirSite?: string | boolean; // Variante de ExibirNoSite
  Video?: string; // URL do vídeo
  Tipo?: string; // Tipo (Youtube, Vimeo, etc.)
}

/**
 * Estrutura de anexo do Vista (PDFs, plantas, documentos)
 * Conforme /imoveis/listarcampos
 */
export interface VistaAnexo {
  Codigo?: string; // Código do registro
  CodigoAnexo?: string; // Código do anexo
  Descricao?: string; // Descrição do arquivo
  Anexo?: string; // URL do arquivo
  Arquivo?: string; // Nome do arquivo
  ExibirNoSite?: string | boolean; // Se deve exibir no site
  ExibirSite?: string | boolean; // Variante de ExibirNoSite
  Data?: string; // Data do upload
}

/**
 * Estrutura de corretor do Vista
 */
export interface VistaCorretor {
  Codigo?: number | string;
  Nome: string;
  Email?: string;
  Fone?: string;
  Celular?: string;
  Telefone?: string;
  Creci?: string;
  Foto?: string;
}

/**
 * Estrutura de agência do Vista
 */
export interface VistaAgencia {
  Codigo?: number | string;
  Nome: string;
  Email?: string;
  Fone?: string;
  Telefone?: string;
  Endereco?: string;
  Numero?: string;
  Complemento?: string;
  Bairro?: string;
  Cidade?: string;
  Logo?: string;
}

/**
 * Resposta de listagem do Vista
 */
export interface VistaListResponse {
  [key: number]: VistaImovel;
  total?: number;
  paginas?: number;
  pagina?: number;
  quantidade?: number;
}

/**
 * Parâmetros de pesquisa do Vista
 */
export interface VistaPesquisa {
  fields?: (string | Record<string, any>)[];
  filter?: Record<string, any>;
  advFilter?: Record<string, any>;
  order?: Record<string, 'asc' | 'desc'>;
  paginacao?: {
    pagina: number;
    quantidade: number;
  };
}

/**
 * Estrutura de EMPREENDIMENTO retornada pelo Vista (módulo dedicado)
 */
export interface VistaEmpreendimento {
  Codigo: number | string;
  NomeEmpreendimento?: string;
  Empreendimento?: string;
  Nome?: string;
  Titulo?: string;
  Descricao?: string;
  DescricaoEmpreendimento?: string;
  Observacao?: string;
  Status?: string;
  Situacao?: string;   // ✅ Campo correto para Status da Obra ("Pronto", "Em Construção", "Lançamento")
  StatusObra?: string; // ❌ Campo antigo (não funciona na maioria das contas)
  StatusEmpreendimento?: string;
  Cidade?: string;
  Bairro?: string;
  Endereco?: string;
  Numero?: string;
  Complemento?: string;
  UF?: string;
  Estado?: string;
  CEP?: string;
  Latitude?: string | number;
  Longitude?: string | number;
  Construtora?: string;
  Incorporadora?: string;
  Arquiteto?: string;
  DataLancamento?: string;
  DataEntrega?: string;
  PrevisaoEntrega?: string;
  DataCadastro?: string;
  DataAtualizacao?: string;
  ValorMinimo?: string | number;
  ValorMaximo?: string | number;
  Valor?: string | number;
  AreaPrivativa?: string | number;
  AreaPrivativaMin?: string | number;
  AreaPrivativaMax?: string | number;
  AreaTotal?: string | number;
  QtdUnidades?: string | number;
  UnidadesDisponiveis?: string | number;
  QtdTorres?: string | number;
  Andares?: string | number;
  UnidadesPorAndar?: string | number;
  FotoDestaque?: string;
  FotoCapa?: string;
  Logo?: string;
  TourVirtual?: string;
  Videos?: string[] | string;
  Folder?: string;
  Plantas?: any[];
  Caracteristicas?: Record<string, 'Sim' | 'Nao'> | string[] | null;
  InfraEstrutura?: string[] | null;
  Fotos?: VistaFoto[];
  fotos?: VistaFoto[];
  [key: string]: any;
}

export interface VistaEmpreendimentoListResponse {
  [key: number]: VistaEmpreendimento;
  total?: number;
  paginas?: number;
  pagina?: number;
  quantidade?: number;
}

/**
 * Parâmetros para criar lead no Vista
 */
export interface VistaLeadInput {
  Nome: string;
  Email?: string;
  Telefone?: string;
  Celular?: string;
  Mensagem?: string;
  Assunto?: string;
  CodigoImovel?: string;
  Origem?: string;
  UTMSource?: string;
  UTMMedium?: string;
  UTMCampaign?: string;
  URLOrigem?: string;
  [key: string]: any;
}

/**
 * Resposta de criação de lead
 */
export interface VistaLeadResponse {
  sucesso?: boolean;
  success?: boolean;
  codigo?: number | string;
  mensagem?: string;
  message?: string;
  erro?: string;
  error?: string;
}

