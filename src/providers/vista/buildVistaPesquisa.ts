/**
 * Helper para construir pesquisa Vista sem "lixo"
 * 
 * Remove valores vazios, undefined, null e "Todos" antes de enviar para API
 */

export type UIFilters = {
  cidade?: string | null;
  bairro?: string | null;
  tipo?: string | null;       // "Apartamento", "Casa"...
  finalidade?: string | null;  // "Venda" | "Locacao"
  precoMin?: number | null;
  precoMax?: number | null;
  quartos?: number | null;     // ex.: mínimo
  suites?: number | null;
  vagas?: number | null;
  status?: string | null;
};

/**
 * Verifica se valor está preenchido e válido
 */
const isFilled = (v: any): boolean => {
  if (v === undefined || v === null) return false;
  const str = String(v).trim().toLowerCase();
  if (str === '' || str === 'todos' || str === 'undefined' || str === 'null') return false;
  return true;
};

/**
 * Constrói objeto pesquisa Vista limpo (sem lixo)
 */
export function buildVistaPesquisaFromUI(
  ui: UIFilters,
  page: number,
  limit: number
) {
  // Mapa de igualdade simples - só adiciona se valor válido
  const filter: Record<string, any> = {};
  
  // ⚠️ REGRA DE NEGÓCIO: Só exibir imóveis com flag "Exibir no site"
  // TEMPORARIAMENTE DESABILITADO PARA DEBUG DO PH1060
  // filter.ExibirSite = 1;
  
  if (isFilled(ui.cidade)) filter.Cidade = ui.cidade;
  if (isFilled(ui.bairro)) filter.Bairro = ui.bairro;
  if (isFilled(ui.tipo)) filter.TipoImovel = ui.tipo;
  if (isFilled(ui.finalidade)) filter.Finalidade = ui.finalidade;
  
  // Faixas numéricas não são suportadas diretamente pela API Vista
  // Serão filtradas no client-side
  
  const pesquisa: any = {
    fields: [
      // === IDENTIFICAÇÃO ===
      "Codigo", "CodigoImovel", "Titulo", "TituloSite", "Categoria", "TipoImovel", "Finalidade", "Status",
      
      // === ENDEREÇO COMPLETO ===
      "Endereco", "Numero", "Complemento", "Bairro", "Cidade", "UF", "Estado", "CEP",
      "Latitude", "Longitude",
      
      // === VALORES COMPLETOS ===
      "ValorVenda", "Valor", "PrecoVenda",
      "ValorLocacao", "ValorAluguel",
      "ValorCondominio", "Condominio",
      "ValorIPTU", "IPTU",
      
      // === ESPECIFICAÇÕES COMPLETAS ===
      "Dormitorios", "Dormitorio",
      "Suites", "Suite",
      "Banheiros", "Banheiro",
      "Lavabos",
      "Vagas", "VagasGaragem",
      "AreaTotal", "AreaPrivativa", "AreaTerreno",
      "Andar", "TotalAndares",
      
      // === EMPREENDIMENTO/CONDOMÍNIO ===
      "Empreendimento", "NomeEmpreendimento", "Condominio", "NomeCondominio",
      
      // === DESCRIÇÕES ===
      "Descricao", "DescricaoWeb", "Observacao", "DescricaoEmpreendimento",
      
      // === CARACTERÍSTICAS ===
      "Mobiliado", "AceitaPet", "Acessibilidade",
      
      // === DIFERENCIAIS ===
      "Churrasqueira", "Lareira", "Piscina", "Academia", "Elevador",
      "Sacada", "Varanda", "VarandaGourmet", "VistaMar", "Sauna", "Portaria24h",
      "Quadra", "SalaoFestas", "Playground", "Bicicletario",
      "Hidromassagem", "Aquecimento", "ArCondicionado", "Alarme",
      "Interfone", "CercaEletrica", "Jardim", "Quintal",
      
      // === MÍDIA ===
      "FotoDestaque", "FotoCapa", "Videos", "TourVirtual",
      
      // === DATAS ===
      "DataCadastro", "DataAtualizacao",
      
      // === FLAGS ===
      "Destaque", "Exclusivo", "Lancamento",
      "ExibirSite", "ExibirWeb", "PublicarSite",
      "SuperDestaque", "DestaqueWeb",
      "TemPlaca", "Placa",
      
      // === RELACIONAMENTOS ===
      { fotos: ["Foto", "FotoGrande", "FotoPequena", "FotoMedia", "Destaque", "Tipo", "Descricao", "Titulo", "Ordem"] },
      { Corretor: ["Codigo", "Nome", "Fone", "Telefone", "Celular", "E-mail", "Email", "Creci", "Foto"] },
      { Agencia: ["Codigo", "Nome", "Fone", "Telefone", "Email", "Endereco", "Numero", "Complemento", "Bairro", "Cidade", "Logo"] },
    ],
    filter,
    paginacao: {
      pagina: Math.max(1, page || 1),
      quantidade: Math.min(Math.max(1, limit || 20), 50)
    },
  };
  
  // Só adiciona filtros se houver algo válido
  if (Object.keys(filter).length === 0) {
    delete pesquisa.filter;
  }
  
  return pesquisa;
}

/**
 * Aplica filtros numéricos no client-side
 */
export function applyClientSideFilters(items: any[], filters: UIFilters): any[] {
  return items.filter(item => {
    // Faixas de preço
    if (isFilled(filters.precoMin)) {
      const preco = Number(item.preco ?? 0);
      if (preco > 0 && preco < Number(filters.precoMin)) return false;
    }
    
    if (isFilled(filters.precoMax)) {
      const preco = Number(item.preco ?? 0);
      if (preco > Number(filters.precoMax)) return false;
    }
    
    // Quartos mínimos
    if (isFilled(filters.quartos)) {
      const quartos = Number(item.quartos ?? 0);
      if (quartos < Number(filters.quartos)) return false;
    }
    
    // Suítes mínimas
    if (isFilled(filters.suites)) {
      const suites = Number(item.suites ?? 0);
      if (suites < Number(filters.suites)) return false;
    }
    
    // Vagas mínimas
    if (isFilled(filters.vagas)) {
      const vagas = Number(item.vagasGaragem ?? item.vagas ?? 0);
      if (vagas < Number(filters.vagas)) return false;
    }
    
    return true;
  });
}

