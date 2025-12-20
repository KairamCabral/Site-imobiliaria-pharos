import type { Empreendimento } from '@/types';
import type { VistaEmpreendimento, VistaFoto } from '@/providers/vista/types';
import {
  cleanDescription,
  cleanString,
  createSlug,
  normalizeCEP,
  parseArea,
  parseInteger,
  parsePrice,
} from '@/mappers/normalizers';

const toArray = <T>(value: T | T[] | undefined | null): T[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const extractFotos = (data: VistaEmpreendimento): string[] => {
  const fotos: VistaFoto[] = toArray(data.Fotos || data.fotos).filter(Boolean) as VistaFoto[];
  const urls = fotos
    .map((f) => f.Foto || f.FotoGrande || f.FotoMedia || f.FotoPequena)
    .filter(Boolean) as string[];

  const fallback = [data.FotoDestaque, data.FotoCapa, data.Logo].filter(Boolean) as string[];
  const unique = Array.from(new Set([...urls, ...fallback]));
  return unique;
};

const normalizeStatus = (data: VistaEmpreendimento): Empreendimento['status'] => {
  const candidates = [
    data.StatusObra,
    data.StatusEmpreendimento,
    data.Status,
    cleanString((data.DescricaoEmpreendimento || data.Descricao || data.Observacao || '').match(/(pré[-\s]?lançamento|pre[-\s]?lancamento|lançamento|em construç|construc|pronto|entregue)/gi)?.[0]),
  ]
    .filter(Boolean)
    .map((v) => String(v).toLowerCase());

  for (const value of candidates) {
    if (value.includes('pré') || value.includes('pre')) return 'pre-lancamento';
    if (value.includes('lanç') || value.includes('lanc')) return 'lancamento';
    if (value.includes('constr')) return 'em-construcao';
    if (value.includes('pronto') || value.includes('entregue')) return 'pronto';
  }
  return 'pronto';
};

const pickNome = (data: VistaEmpreendimento): string => {
  return (
    cleanString(data.NomeEmpreendimento) ||
    cleanString(data.Empreendimento) ||
    cleanString((data as any).NomeCondominio) ||
    cleanString((data as any).Condominio) ||
    cleanString(data.Nome) ||
    cleanString(data.Titulo) ||
    'Empreendimento'
  );
};

const parseVideos = (videos?: string[] | string): string[] => {
  if (!videos) return [];
  if (Array.isArray(videos)) return videos.filter(Boolean);
  return [videos].filter(Boolean);
};

const parseAreas = (data: VistaEmpreendimento) => {
  const areas = [
    parseArea(data.AreaPrivativaMin),
    parseArea(data.AreaPrivativa),
    parseArea(data.AreaTotal),
  ].filter((v) => v !== undefined) as number[];

  const areaDesde = areas.length ? Math.min(...areas) : undefined;
  const areaAte = areas.length ? Math.max(...areas) : undefined;
  return { areaDesde, areaAte };
};

const parsePrecos = (data: VistaEmpreendimento) => {
  const valores = [
    parsePrice(data.ValorMinimo),
    parsePrice(data.Valor),
    parsePrice((data as any).ValorVenda),
    parsePrice(data.ValorMaximo),
  ].filter((v) => v !== undefined) as number[];

  const precoDesde = valores.length ? Math.min(...valores) : undefined;
  const precoAte = valores.length ? Math.max(...valores) : undefined;
  return { precoDesde, precoAte };
};

export function mapVistaToEmpreendimento(data: VistaEmpreendimento): Empreendimento {
  const nome = pickNome(data);
  const slug = createSlug(`${nome}-${data.Codigo ?? ''}`.trim());
  const descricao =
    cleanDescription(data.DescricaoEmpreendimento) ||
    cleanDescription(data.Descricao) ||
    cleanDescription(data.Observacao) ||
    '';

  const { areaDesde, areaAte } = parseAreas(data);
  const { precoDesde, precoAte } = parsePrecos(data);
  const fotos = extractFotos(data);

  return {
    id: String(data.Codigo ?? slug),
    slug,
    nome,
    descricao,
    descricaoCompleta: descricao,
    endereco: {
      rua: cleanString(data.Endereco) || '',
      numero: cleanString(data.Numero) || '',
      complemento: cleanString(data.Complemento) || '',
      bairro: cleanString(data.Bairro) || '',
      cidade: cleanString(data.Cidade) || '',
      estado: cleanString(data.UF || data.Estado) || '',
      cep: normalizeCEP(data.CEP) || '',
      coordenadas: {
        latitude: data.Latitude ? Number(data.Latitude) : 0,
        longitude: data.Longitude ? Number(data.Longitude) : 0,
      },
    },
    construtora: cleanString(data.Construtora) || 'Construtora não informada',
    incorporadora: cleanString(data.Incorporadora),
    arquiteto: cleanString(data.Arquiteto),
    status: normalizeStatus(data),
    dataLancamento: cleanString(data.DataLancamento) || '',
    dataPrevisaoEntrega: cleanString(data.PrevisaoEntrega || data.DataEntrega),
    dataEntrega: cleanString((data as any).DataConclusao),
    tipoEmpreendimento: 'residencial',
    totalUnidades: parseInteger(data.QtdUnidades) ?? 0,
    unidadesDisponiveis: parseInteger(data.UnidadesDisponiveis) ?? 0,
    totalTorres: parseInteger(data.QtdTorres),
    andaresPorTorre: parseInteger(data.Andares),
    unidadesPorAndar: parseInteger(data.UnidadesPorAndar),
    diferenciais: Object.keys((data.Caracteristicas as Record<string, any>) || {}).filter(
      (key) => (data.Caracteristicas as Record<string, any>)?.[key] === 'Sim'
    ),
    areasComuns: toArray(data.InfraEstrutura).filter(Boolean) as string[],
    lazer: [],
    seguranca: [],
    sustentabilidade: [],
    imagemCapa: fotos[0] || '',
    imagemDestaque: fotos[1],
    galeria: fotos,
    videosYoutube: parseVideos(data.Videos),
    tourVirtual: cleanString(data.TourVirtual),
    folderPdf: cleanString(data.Folder || (data as any).FolderPDF),
    plantas: toArray(data.Plantas),
    logotipo: cleanString(data.Logo),
    precoDesde,
    precoAte,
    areaDesde,
    areaAte,
    metaTitle: nome,
    metaDescription: descricao?.slice(0, 155) || nome,
    keywords: [nome, data.Bairro, data.Cidade].filter(Boolean) as string[],
    imoveisIds: [],
    visualizacoes: 0,
    createdAt: cleanString(data.DataCadastro) || '',
    updatedAt: cleanString(data.DataAtualizacao) || '',
  };
}

