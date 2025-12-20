import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Checkbox } from '@/components/Checkbox';

export const metadata = {
  title: 'Anunciar Imóvel | Pharos Negócios Imobiliários',
  description: 'Anuncie seu imóvel com a Pharos e tenha acesso a uma rede de compradores qualificados para imóveis de alto padrão.',
};

export default function AnunciarImovel() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Banner Hero */}
      <section className="relative bg-secondary-800 text-white py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-900 to-secondary-800/70">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ 
            backgroundImage: 'url("/banner-home.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-h3 md:text-h2 font-bold mb-4">
              Anuncie seu imóvel
            </h1>
            <p className="text-body-lg mb-0 text-tertiary-300">
              Cadastre seu imóvel em nossa plataforma e alcance compradores qualificados.
            </p>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-h3 font-bold text-center mb-4">Como funciona</h2>
          <p className="text-body-lg text-secondary-600 text-center max-w-3xl mx-auto mb-12">
            Anunciar seu imóvel com a Pharos é simples, rápido e eficiente. Confira o passo a passo:
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mb-6">
                <span className="font-bold">1</span>
              </div>
              <h3 className="text-h6 font-bold mb-3">Cadastre seu imóvel</h3>
              <p className="text-secondary-600">
                Preencha o formulário com as informações do seu imóvel e envie para nossa análise.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mb-6">
                <span className="font-bold">2</span>
              </div>
              <h3 className="text-h6 font-bold mb-3">Avaliação</h3>
              <p className="text-secondary-600">
                Nossa equipe entra em contato para avaliar o imóvel e definir o valor de mercado.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mb-6">
                <span className="font-bold">3</span>
              </div>
              <h3 className="text-h6 font-bold mb-3">Produção de conteúdo</h3>
              <p className="text-secondary-600">
                Realizamos fotos profissionais e criamos descrições atrativas para o seu imóvel.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mb-6">
                <span className="font-bold">4</span>
              </div>
              <h3 className="text-h6 font-bold mb-3">Publicação e divulgação</h3>
              <p className="text-secondary-600">
                Seu imóvel é publicado em nossa plataforma e divulgado para compradores qualificados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Formulário */}
      <section className="py-16 bg-tertiary-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-card p-8">
            <h2 className="text-h4 font-bold mb-6">Cadastre seu imóvel</h2>
            <p className="text-secondary-600 mb-8">
              Preencha o formulário abaixo com as informações do seu imóvel. Nossa equipe entrará em contato em até 24 horas úteis.
            </p>

            <form className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-h6 font-bold mb-4">Informações do imóvel</h3>
              </div>

              <div>
                <Select 
                  label="Tipo de imóvel" 
                  options={[
                    { value: 'apartamento', label: 'Apartamento' },
                    { value: 'casa', label: 'Casa' },
                    { value: 'terreno', label: 'Terreno' },
                    { value: 'comercial', label: 'Comercial' }
                  ]}
                  required
                />
              </div>

              <div>
                <Select 
                  label="Finalidade" 
                  options={[
                    { value: 'venda', label: 'Venda' },
                    { value: 'aluguel', label: 'Aluguel' },
                    { value: 'venda-aluguel', label: 'Venda e Aluguel' }
                  ]}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Input 
                  label="Endereço completo" 
                  placeholder="Rua, número, bairro, cidade, estado" 
                  required
                />
              </div>

              <div>
                <Input 
                  label="Área total (m²)" 
                  placeholder="Ex: 120" 
                  type="number"
                  required
                />
              </div>

              <div>
                <Input 
                  label="Valor pretendido (R$)" 
                  placeholder="Ex: 500000" 
                  type="number"
                  required
                />
              </div>

              <div>
                <Input 
                  label="Número de quartos" 
                  placeholder="Ex: 3" 
                  type="number"
                />
              </div>

              <div>
                <Input 
                  label="Número de banheiros" 
                  placeholder="Ex: 2" 
                  type="number"
                />
              </div>

              <div>
                <Input 
                  label="Vagas de garagem" 
                  placeholder="Ex: 2" 
                  type="number"
                />
              </div>

              <div>
                <Select 
                  label="Estado do imóvel" 
                  options={[
                    { value: 'novo', label: 'Novo' },
                    { value: 'usado', label: 'Usado' },
                    { value: 'em-construcao', label: 'Em construção' },
                    { value: 'na-planta', label: 'Na planta' }
                  ]}
                />
              </div>

              <div className="md:col-span-2">
                <Input 
                  label="Características principais" 
                  placeholder="Ex: Vista para o mar, mobiliado, reformado, etc." 
                />
              </div>

              <div className="md:col-span-2">
                <h3 className="text-h6 font-bold mb-4 mt-2">Informações de contato</h3>
              </div>

              <div>
                <Input 
                  label="Nome completo" 
                  placeholder="Seu nome completo" 
                  required
                />
              </div>

              <div>
                <Input 
                  label="E-mail" 
                  placeholder="Seu e-mail" 
                  type="email"
                  required
                />
              </div>

              <div>
                <Input 
                  label="Telefone" 
                  placeholder="(00) 00000-0000" 
                  required
                />
              </div>

              <div>
                <Select 
                  label="Melhor horário para contato" 
                  options={[
                    { value: 'manha', label: 'Período da manhã' },
                    { value: 'tarde', label: 'Período da tarde' },
                    { value: 'noite', label: 'Período da noite' }
                  ]}
                />
              </div>

              <div className="md:col-span-2">
                <div className="mb-4 w-full">
                  <label htmlFor="observacoes" className="block text-body-sm text-secondary-700 mb-2">
                    Observações adicionais
                  </label>
                  <textarea
                    id="observacoes"
                    className="w-full px-4 py-3 border border-secondary-200 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-200"
                    placeholder="Informações adicionais sobre o imóvel ou preferências de contato"
                    rows={4}
                  ></textarea>
                </div>
              </div>

              <div className="md:col-span-2">
                <Checkbox 
                  label="Concordo com a Política de Privacidade e os Termos de Uso da Pharos Negócios Imobiliários"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Button type="submit" className="mt-4">
                  Cadastrar imóvel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-h3 font-bold text-center mb-4">O que dizem nossos clientes</h2>
          <p className="text-body-lg text-secondary-600 text-center max-w-3xl mx-auto mb-12">
            Confira o depoimento de quem já vendeu ou alugou seu imóvel com a Pharos.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-tertiary-50 rounded-lg p-8 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image 
                    src="/depoimentos/cliente-1.jpg" 
                    alt="Carlos Silva" 
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold">Carlos Silva</h4>
                  <p className="text-sm text-secondary-600">Vendeu apartamento em 45 dias</p>
                </div>
              </div>
              <p className="text-secondary-600">
                "A Pharos conduziu todo o processo de venda do meu apartamento com muita profissionalismo. As fotos ficaram incríveis e o imóvel foi vendido em apenas 45 dias."
              </p>
            </div>

            <div className="bg-tertiary-50 rounded-lg p-8 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image 
                    src="/depoimentos/cliente-2.jpg" 
                    alt="Ana Oliveira" 
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold">Ana Oliveira</h4>
                  <p className="text-sm text-secondary-600">Alugou casa em 30 dias</p>
                </div>
              </div>
              <p className="text-secondary-600">
                "Minha casa estava para alugar em outra imobiliária há meses sem sucesso. Com a Pharos, consegui alugar em apenas 30 dias e com um valor acima do que eu esperava."
              </p>
            </div>

            <div className="bg-tertiary-50 rounded-lg p-8 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image 
                    src="/depoimentos/cliente-3.jpg" 
                    alt="Roberto Santos" 
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold">Roberto Santos</h4>
                  <p className="text-sm text-secondary-600">Vendeu cobertura em 60 dias</p>
                </div>
              </div>
              <p className="text-secondary-600">
                "O atendimento personalizado da Pharos fez toda a diferença. Eles entenderam as particularidades da minha cobertura e conseguiram encontrar o comprador ideal."
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 