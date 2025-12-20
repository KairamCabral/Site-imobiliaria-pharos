import type { Metadata } from 'next';
import { EmpreendimentosClient } from './EmpreendimentosClient';
import { listarEmpreendimentos } from '@/data/empreendimentos';
import type { Empreendimento } from '@/types';
import type { SortOption, StatusFilter } from '@/hooks/useEmpreendimentosFilter';

export const revalidate = 300; // 5 minutos
export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 50;

const parseString = (value?: string | string[] | null): string =>
  Array.isArray(value) ? value[0] || '' : value || '';

const normalizeStatus = (value?: string): StatusFilter => {
  const status = (value || '').toLowerCase();
  if (status === 'pre-lancamento') return 'pre-lancamento';
  if (status === 'lancamento') return 'lancamento';
  if (status === 'em-construcao') return 'em-construcao';
  if (status === 'pronto') return 'pronto';
  if (status === 'entregue') return 'entregue';
  return 'todos';
};

const normalizeSort = (value?: string): SortOption => {
  const sort = (value || '').toLowerCase();
  if (sort === 'lancamento') return 'lancamento';
  if (sort === 'preco-asc') return 'preco-asc';
  if (sort === 'preco-desc') return 'preco-desc';
  if (sort === 'nome') return 'nome';
  return 'relevancia';
};

const mapSortToProvider = (sort: SortOption) => {
  switch (sort) {
    case 'preco-asc':
      return { sortBy: 'price' as const, sortOrder: 'asc' as const };
    case 'preco-desc':
      return { sortBy: 'price' as const, sortOrder: 'desc' as const };
    case 'nome':
      return { sortBy: 'name' as const, sortOrder: 'asc' as const };
    case 'lancamento':
      return { sortBy: 'updatedAt' as const, sortOrder: 'desc' as const };
    default:
      return { sortBy: 'updatedAt' as const, sortOrder: 'desc' as const };
  }
};

const buildStats = (items: Empreendimento[]) => {
  const base = {
    preLancamento: 0,
    lancamento: 0,
    construcao: 0,
    prontos: 0,
  };

  items.forEach((item) => {
    switch (item.status) {
      case 'pre-lancamento':
        base.preLancamento += 1;
        break;
      case 'lancamento':
        base.lancamento += 1;
        break;
      case 'em-construcao':
        base.construcao += 1;
        break;
      case 'pronto':
      case 'entregue':
        base.prontos += 1;
        break;
      default:
        break;
    }
  });

  return base;
};

export const metadata: Metadata = {
  title: 'Empreendimentos em Balneário Camboriú | Pharos Negócios Imobiliários',
  description:
    'Encontre lançamentos, pré-lançamentos e empreendimentos prontos em Balneário Camboriú com a Pharos. Veja valores, metragens, diferenciais e solicite uma visita.',
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EmpreendimentosPage(props: PageProps) {
  const resolvedSearchParams = await props.searchParams;

  const search = parseString(resolvedSearchParams?.q ?? resolvedSearchParams?.search);
  const status = normalizeStatus(parseString(resolvedSearchParams?.status));
  const sort = normalizeSort(parseString(resolvedSearchParams?.sort));
  const page = Number.parseInt(parseString(resolvedSearchParams?.page), 10) || 1;

  const { sortBy, sortOrder } = mapSortToProvider(sort);

  const { items, total } = await listarEmpreendimentos({
    search: search || undefined,
    status: status !== 'todos' ? status : undefined,
    sortBy,
    sortOrder,
    page,
    limit: DEFAULT_LIMIT,
  });

  const stats = buildStats(items);

  return (
    <EmpreendimentosClient
      empreendimentos={items}
      total={total}
      stats={stats}
      initialSearch={search}
      initialStatus={status}
      initialSort={sort}
    />
  );
}

