import type { ComponentProps } from 'react';
import type ImovelCard from '@/components/ImovelCard';
import type { Imovel } from '@/types';

type ImovelCardProps = ComponentProps<typeof ImovelCard>;

export function buildImovelCardProps(imovel: Imovel): ImovelCardProps {
  const endereco = (() => {
    if (!imovel.endereco) return '';
    const rua = imovel.endereco.rua?.trim() ?? '';
    const numero = imovel.endereco.numero ? `, ${imovel.endereco.numero}` : '';
    const bairro = imovel.endereco.bairro?.trim() ?? '';
    const cidade = imovel.endereco.cidade?.trim() ?? '';
    const parts = [
      rua ? `${rua}${numero}` : '',
      bairro,
      cidade,
    ].filter(Boolean);
    return parts.join(' - ');
  })();

  const imagens = Array.isArray(imovel.galeria) ? [...imovel.galeria] : [];
  if (imagens.length === 0 && imovel.imagemCapa) {
    imagens.push(imovel.imagemCapa);
  }

  return {
    id: imovel.id,
    titulo: imovel.titulo,
    endereco,
    preco: imovel.preco ?? 0,
    quartos: imovel.quartos ?? 0,
    banheiros: imovel.banheiros ?? 0,
    suites: imovel.suites ?? 0,
    area: imovel.areaPrivativa ?? imovel.areaTotal ?? 0,
    imagens: imagens.filter((url): url is string => typeof url === 'string' && url.length > 0),
    tipoImovel: imovel.tipo,
    destaque: imovel.destaque,
    caracteristicas: imovel.caracteristicas ?? imovel.diferenciais ?? [],
    caracteristicasImovel: imovel.caracteristicasImovel ?? [],
    caracteristicasLocalizacao: imovel.caracteristicasLocalizacao ?? [],
    vagas: imovel.vagasGaragem ?? 0,
    distanciaMar: imovel.distanciaMar ?? imovel.distancia_mar_m,
  };
}

