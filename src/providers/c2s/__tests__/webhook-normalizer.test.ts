/**
 * Testes para normalização de payloads do webhook C2S
 */

import { normalizeC2SWebhookPayload } from '../utils';

describe('normalizeC2SWebhookPayload', () => {
  describe('Formato JSON:API', () => {
    it('deve normalizar payload válido no formato JSON:API', () => {
      const payload = {
        type: 'lead',
        id: '12345',
        attributes: {
          customer: {
            name: 'João Silva',
            email: 'joao@example.com',
            phone: '5548999999999',
          },
          lead_status: {
            id: 1,
            alias: 'novo',
            name: 'Novo Lead',
          },
          lead_source: {
            id: 10,
            name: 'Site Pharos',
          },
          seller: {
            id: '100',
            name: 'Maria Vendedora',
            email: 'maria@pharos.com',
          },
          product: {
            license_plate: 'APT-001',
            description: 'Apartamento 3 quartos',
            price: 350000,
          },
        },
      };

      const result = normalizeC2SWebhookPayload(payload);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('12345');
      expect(result?.customer.name).toBe('João Silva');
      expect(result?.customer.email).toBe('joao@example.com');
      expect(result?.lead_status.alias).toBe('novo');
      expect(result?.lead_source?.name).toBe('Site Pharos');
      expect(result?.seller?.name).toBe('Maria Vendedora');
      expect(result?.product?.license_plate).toBe('APT-001');
    });

    it('deve retornar null se customer estiver ausente no JSON:API', () => {
      const payload = {
        type: 'lead',
        id: '12345',
        attributes: {
          lead_status: {
            id: 1,
            alias: 'novo',
          },
        },
      };

      const result = normalizeC2SWebhookPayload(payload);
      expect(result).toBeNull();
    });

    it('deve retornar null se lead_status estiver ausente no JSON:API', () => {
      const payload = {
        type: 'lead',
        id: '12345',
        attributes: {
          customer: {
            name: 'João Silva',
          },
        },
      };

      const result = normalizeC2SWebhookPayload(payload);
      expect(result).toBeNull();
    });

    it('deve retornar null se customer.name for inválido', () => {
      const payload = {
        type: 'lead',
        id: '12345',
        attributes: {
          customer: {
            email: 'joao@example.com',
          },
          lead_status: {
            id: 1,
            alias: 'novo',
          },
        },
      };

      const result = normalizeC2SWebhookPayload(payload);
      expect(result).toBeNull();
    });
  });

  describe('Formato Flat', () => {
    it('deve normalizar payload válido no formato flat', () => {
      const payload = {
        id: '12345',
        customer: {
          name: 'João Silva',
          email: 'joao@example.com',
          phone: '5548999999999',
        },
        lead_status: {
          id: 1,
          alias: 'novo',
          name: 'Novo Lead',
        },
        lead_source: {
          id: 10,
          name: 'Site Pharos',
        },
        seller: {
          id: '100',
          name: 'Maria Vendedora',
        },
      };

      const result = normalizeC2SWebhookPayload(payload);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('12345');
      expect(result?.customer.name).toBe('João Silva');
      expect(result?.customer.email).toBe('joao@example.com');
      expect(result?.lead_status.alias).toBe('novo');
      expect(result?.lead_source?.name).toBe('Site Pharos');
    });

    it('deve retornar null se customer estiver ausente no formato flat', () => {
      const payload = {
        id: '12345',
        lead_status: {
          id: 1,
          alias: 'novo',
        },
      };

      const result = normalizeC2SWebhookPayload(payload);
      expect(result).toBeNull();
    });

    it('deve retornar null se lead_status estiver ausente no formato flat', () => {
      const payload = {
        id: '12345',
        customer: {
          name: 'João Silva',
        },
      };

      const result = normalizeC2SWebhookPayload(payload);
      expect(result).toBeNull();
    });
  });

  describe('Payloads inválidos', () => {
    it('deve retornar null para payload null', () => {
      const result = normalizeC2SWebhookPayload(null);
      expect(result).toBeNull();
    });

    it('deve retornar null para payload undefined', () => {
      const result = normalizeC2SWebhookPayload(undefined);
      expect(result).toBeNull();
    });

    it('deve retornar null para payload que não é objeto', () => {
      const result = normalizeC2SWebhookPayload('string');
      expect(result).toBeNull();
    });

    it('deve retornar null para payload em formato não reconhecido', () => {
      const payload = {
        some_random_field: 'value',
        another_field: 123,
      };

      const result = normalizeC2SWebhookPayload(payload);
      expect(result).toBeNull();
    });

    it('deve retornar null para objeto vazio', () => {
      const result = normalizeC2SWebhookPayload({});
      expect(result).toBeNull();
    });
  });

  describe('Campos opcionais', () => {
    it('deve funcionar sem campos opcionais no JSON:API', () => {
      const payload = {
        type: 'lead',
        id: '12345',
        attributes: {
          customer: {
            name: 'João Silva',
          },
          lead_status: {
            id: 1,
            alias: 'novo',
          },
        },
      };

      const result = normalizeC2SWebhookPayload(payload);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('12345');
      expect(result?.customer.name).toBe('João Silva');
      expect(result?.customer.email).toBeUndefined();
      expect(result?.lead_source).toBeUndefined();
      expect(result?.seller).toBeUndefined();
      expect(result?.product).toBeUndefined();
    });

    it('deve funcionar sem campos opcionais no formato flat', () => {
      const payload = {
        id: '12345',
        customer: {
          name: 'João Silva',
        },
        lead_status: {
          id: 1,
          alias: 'novo',
        },
      };

      const result = normalizeC2SWebhookPayload(payload);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('12345');
      expect(result?.customer.name).toBe('João Silva');
      expect(result?.lead_source).toBeUndefined();
    });
  });

  describe('Valores edge case', () => {
    it('deve lidar com IDs numéricos', () => {
      const payload = {
        type: 'lead',
        id: '12345',
        attributes: {
          customer: {
            name: 'João Silva',
          },
          lead_status: {
            id: 1,
            alias: 'novo',
          },
        },
      };

      const result = normalizeC2SWebhookPayload(payload);

      expect(result).not.toBeNull();
      expect(result?.lead_status.id).toBe(1);
    });

    it('deve lidar com customer com campos extras não especificados', () => {
      const payload = {
        id: '12345',
        customer: {
          name: 'João Silva',
          email: 'joao@example.com',
          phone: '5548999999999',
          phone2: '5548988888888',
          neighbourhood: 'Centro',
          extra_field: 'should be ignored',
        },
        lead_status: {
          id: 1,
          alias: 'novo',
        },
      };

      const result = normalizeC2SWebhookPayload(payload);

      expect(result).not.toBeNull();
      expect(result?.customer.phone2).toBe('5548988888888');
      expect(result?.customer.neighbourhood).toBe('Centro');
    });
  });
});

