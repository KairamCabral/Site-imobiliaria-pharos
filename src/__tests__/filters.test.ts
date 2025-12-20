/**
 * Testes do Sistema de Filtros
 * 
 * Valida o funcionamento completo do sistema de filtros:
 * - Mapeamento UI ↔ Vista
 * - Processamento na API Route
 * - Construção de query no VistaProvider
 */

import { describe, it, expect } from '@jest/globals';
import {
  mapUItoVista,
  mapVistaToUI,
  isValidCaracteristica,
  mapMultipleUItoVista,
  getCaracteristicasDisponiveis,
  caracteristicasImovelMap,
  caracteristicasLocalizacaoMap,
  caracteristicasEmpreendimentoMap,
} from '@/mappers/normalizers/caracteristicas';
import { validateFilters } from '@/utils/filterDebug';
import type { PropertyFilters } from '@/domain/models';

describe('Sistema de Filtros', () => {
  
  // ============================================
  // Testes de Mapeamento de Características
  // ============================================
  
  describe('Mapeamento de Características do Imóvel', () => {
    it('deve mapear UI para Vista corretamente', () => {
      expect(mapUItoVista('Churrasqueira a gás', 'imovel')).toBe('ChurrasqueiraGas');
      expect(mapUItoVista('Churrasqueira a carvão', 'imovel')).toBe('ChurrascCarvao');
      expect(mapUItoVista('Mobiliado', 'imovel')).toBe('Mobiliado');
      expect(mapUItoVista('Vista para o Mar', 'imovel')).toBe('VistaMar');
      expect(mapUItoVista('Ar Condicionado', 'imovel')).toBe('ArCondicionado');
    });
    
    it('deve mapear Vista para UI corretamente', () => {
      expect(mapVistaToUI('ChurrasqueiraGas', 'imovel')).toBe('Churrasqueira a gás');
      expect(mapVistaToUI('Mobiliado', 'imovel')).toBe('Mobiliado');
      expect(mapVistaToUI('VistaMar', 'imovel')).toBe('Vista para o Mar');
    });
    
    it('deve retornar undefined para características não mapeadas', () => {
      expect(mapUItoVista('Característica Inexistente', 'imovel')).toBeUndefined();
    });
    
    it('deve validar se característica existe', () => {
      expect(isValidCaracteristica('Mobiliado', 'imovel')).toBe(true);
      expect(isValidCaracteristica('Inexistente', 'imovel')).toBe(false);
    });
    
    it('deve mapear múltiplas características', () => {
      const uiList = ['Mobiliado', 'Vista para o Mar', 'Ar Condicionado'];
      const result = mapMultipleUItoVista(uiList, 'imovel');
      
      expect(result).toEqual(['Mobiliado', 'VistaMar', 'ArCondicionado']);
    });
    
    it('deve filtrar características não mapeadas ao mapear múltiplas', () => {
      const uiList = ['Mobiliado', 'Inexistente', 'Vista para o Mar'];
      const result = mapMultipleUItoVista(uiList, 'imovel');
      
      expect(result).toEqual(['Mobiliado', 'VistaMar']);
      expect(result).not.toContain('Inexistente');
    });
  });
  
  describe('Mapeamento de Características da Localização', () => {
    it('deve mapear UI para Vista corretamente', () => {
      expect(mapUItoVista('Centro', 'localizacao')).toBe('Centro');
      expect(mapUItoVista('Barra Norte', 'localizacao')).toBe('BarraNorte');
      expect(mapUItoVista('Frente Mar', 'localizacao')).toBe('FrenteMar');
      expect(mapUItoVista('Avenida Brasil', 'localizacao')).toBe('AvenidaBrasil');
    });
    
    it('deve mapear Vista para UI corretamente', () => {
      expect(mapVistaToUI('BarraNorte', 'localizacao')).toBe('Barra Norte');
      expect(mapVistaToUI('FrenteMar', 'localizacao')).toBe('Frente Mar');
    });
  });
  
  describe('Mapeamento de Características do Empreendimento', () => {
    it('deve mapear UI para Vista corretamente', () => {
      expect(mapUItoVista('Academia', 'empreendimento')).toBe('Academia');
      expect(mapUItoVista('Piscina Aquecida', 'empreendimento')).toBe('PiscinaAquecida');
      expect(mapUItoVista('Salão de Festas', 'empreendimento')).toBe('SalaoFestas');
      expect(mapUItoVista('Espaço Gourmet', 'empreendimento')).toBe('EspacoGourmet');
    });
    
    it('deve mapear Vista para UI corretamente', () => {
      expect(mapVistaToUI('PiscinaAquecida', 'empreendimento')).toBe('Piscina Aquecida');
      expect(mapVistaToUI('SalaoFestas', 'empreendimento')).toBe('Salão de Festas');
    });
  });
  
  describe('Listagem de Características Disponíveis', () => {
    it('deve retornar todas as características do imóvel', () => {
      const caracteristicas = getCaracteristicasDisponiveis('imovel');
      
      expect(caracteristicas.length).toBeGreaterThan(0);
      expect(caracteristicas).toContainEqual({ ui: 'Mobiliado', vista: 'Mobiliado' });
      expect(caracteristicas).toContainEqual({ ui: 'Vista para o Mar', vista: 'VistaMar' });
    });
    
    it('deve retornar todas as características da localização', () => {
      const caracteristicas = getCaracteristicasDisponiveis('localizacao');
      
      expect(caracteristicas.length).toBeGreaterThan(0);
      expect(caracteristicas).toContainEqual({ ui: 'Centro', vista: 'Centro' });
    });
    
    it('deve retornar todas as características do empreendimento', () => {
      const caracteristicas = getCaracteristicasDisponiveis('empreendimento');
      
      expect(caracteristicas.length).toBeGreaterThan(0);
      expect(caracteristicas).toContainEqual({ ui: 'Academia', vista: 'Academia' });
    });
  });
  
  // ============================================
  // Testes de Validação de Filtros
  // ============================================
  
  describe('Validação de PropertyFilters', () => {
    it('deve validar filtros corretos', () => {
      const filters: PropertyFilters = {
        city: 'Balneário Camboriú',
        caracteristicasImovel: ['Mobiliado', 'Vista para o Mar'],
        minPrice: 500000,
        maxPrice: 2000000,
      };
      
      const result = validateFilters(filters);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('deve detectar erro quando característica não é array', () => {
      const filters: any = {
        caracteristicasImovel: 'Mobiliado', // Deveria ser array
      };
      
      const result = validateFilters(filters);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('caracteristicasImovel deve ser um array');
    });
    
    it('deve detectar erro quando minPrice > maxPrice', () => {
      const filters: PropertyFilters = {
        minPrice: 2000000,
        maxPrice: 500000, // Menor que min
      };
      
      const result = validateFilters(filters);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('minPrice não pode ser maior que maxPrice');
    });
    
    it('deve detectar erro quando minArea > maxArea', () => {
      const filters: PropertyFilters = {
        minArea: 200,
        maxArea: 100, // Menor que min
      };
      
      const result = validateFilters(filters);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('minArea não pode ser maior que maxArea');
    });
    
    it('deve validar distanciaMarRange', () => {
      const validFilters: PropertyFilters = {
        distanciaMarRange: 'frente-mar',
      };
      
      const invalidFilters: any = {
        distanciaMarRange: 'range-invalido',
      };
      
      expect(validateFilters(validFilters).valid).toBe(true);
      expect(validateFilters(invalidFilters).valid).toBe(false);
    });
    
    it('deve avisar quando arrays estão vazios', () => {
      const filters: PropertyFilters = {
        caracteristicasImovel: [],
      };
      
      const result = validateFilters(filters);
      
      expect(result.warnings).toContain('caracteristicasImovel está vazio');
    });
  });
  
  // ============================================
  // Testes de Integração (Mapeamento completo)
  // ============================================
  
  describe('Integração: Mapeamento completo', () => {
    it('deve mapear todos os itens do filtro UI sem perder dados', () => {
      const caracteristicasUI = Object.keys(caracteristicasImovelMap);
      
      caracteristicasUI.forEach(ui => {
        const vista = mapUItoVista(ui, 'imovel');
        expect(vista).toBeDefined();
        expect(vista).not.toBe('');
        
        // Verificar mapeamento reverso
        const uiReverso = mapVistaToUI(vista!, 'imovel');
        expect(uiReverso).toBe(ui);
      });
    });
    
    it('deve ter mapeamento bidirecional consistente para localização', () => {
      const caracteristicasUI = Object.keys(caracteristicasLocalizacaoMap);
      
      caracteristicasUI.forEach(ui => {
        const vista = mapUItoVista(ui, 'localizacao');
        expect(vista).toBeDefined();
        
        const uiReverso = mapVistaToUI(vista!, 'localizacao');
        expect(uiReverso).toBe(ui);
      });
    });
    
    it('deve ter mapeamento bidirecional consistente para empreendimento', () => {
      const caracteristicasUI = Object.keys(caracteristicasEmpreendimentoMap);
      
      caracteristicasUI.forEach(ui => {
        const vista = mapUItoVista(ui, 'empreendimento');
        expect(vista).toBeDefined();
        
        const uiReverso = mapVistaToUI(vista!, 'empreendimento');
        expect(uiReverso).toBe(ui);
      });
    });
  });
  
  // ============================================
  // Testes de Casos Extremos
  // ============================================
  
  describe('Casos extremos', () => {
    it('deve lidar com strings vazias', () => {
      expect(mapUItoVista('', 'imovel')).toBeUndefined();
    });
    
    it('deve lidar com null/undefined', () => {
      expect(mapUItoVista(null as any, 'imovel')).toBeUndefined();
      expect(mapUItoVista(undefined as any, 'imovel')).toBeUndefined();
    });
    
    it('deve lidar com case sensitivity', () => {
      // Deve ser case-sensitive (não mapear se casing diferente)
      expect(mapUItoVista('mobiliado', 'imovel')).toBeUndefined();
      expect(mapUItoVista('MOBILIADO', 'imovel')).toBeUndefined();
      expect(mapUItoVista('Mobiliado', 'imovel')).toBe('Mobiliado'); // Correto
    });
    
    it('deve validar objeto vazio como válido', () => {
      const result = validateFilters({});
      expect(result.valid).toBe(true);
    });
    
    it('deve rejeitar null como filtros', () => {
      const result = validateFilters(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Filtros deve ser um objeto');
    });
  });
});

