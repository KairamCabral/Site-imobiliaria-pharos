/**
 * Lead Queue System
 * 
 * Fila para retry de leads que falharam ao serem enviados ao C2S
 * Implementa retry automático com exponential backoff
 */

import type { LeadInput } from '@/domain/models';
import type { Property } from '@/domain/models/Property';
import { createLog, createErrorLog } from './utils';

export interface QueuedLead {
  id: string;
  lead: LeadInput;
  property?: Property;
  attempts: number;
  maxAttempts: number;
  lastAttempt?: Date;
  createdAt: Date;
  error?: string;
}

/**
 * Sistema de fila de leads para retry
 */
export class LeadQueue {
  private queue: Map<string, QueuedLead> = new Map();
  private processingInterval: NodeJS.Timeout | null = null;
  private isProcessing: boolean = false;
  
  private readonly MAX_ATTEMPTS = 3;
  private readonly RETRY_INTERVAL = 5 * 60 * 1000; // 5 minutos
  private readonly QUEUE_PROCESS_INTERVAL = 60 * 1000; // 1 minuto

  constructor() {
    // Inicia processamento automático
    this.startProcessing();
  }

  /**
   * Adiciona lead à fila
   */
  addToQueue(
    lead: LeadInput,
    property?: Property,
    error?: string
  ): string {
    const id = this.generateId(lead);

    const queuedLead: QueuedLead = {
      id,
      lead,
      property,
      attempts: 0,
      maxAttempts: this.MAX_ATTEMPTS,
      createdAt: new Date(),
      error,
    };

    this.queue.set(id, queuedLead);

    createLog('queue:added', {
      id,
      leadName: lead.name,
      propertyCode: lead.propertyCode,
      queueSize: this.queue.size,
    });

    return id;
  }

  /**
   * Remove lead da fila
   */
  removeFromQueue(id: string): boolean {
    const removed = this.queue.delete(id);

    if (removed) {
      createLog('queue:removed', {
        id,
        queueSize: this.queue.size,
      });
    }

    return removed;
  }

  /**
   * Retorna lead da fila
   */
  getFromQueue(id: string): QueuedLead | undefined {
    return this.queue.get(id);
  }

  /**
   * Retorna todos os leads da fila
   */
  getAllQueued(): QueuedLead[] {
    return Array.from(this.queue.values());
  }

  /**
   * Retorna estatísticas da fila
   */
  getStats() {
    const queued = this.getAllQueued();

    return {
      total: queued.length,
      byAttempts: {
        first: queued.filter(l => l.attempts === 0).length,
        second: queued.filter(l => l.attempts === 1).length,
        third: queued.filter(l => l.attempts === 2).length,
        maxed: queued.filter(l => l.attempts >= this.MAX_ATTEMPTS).length,
      },
      oldestCreated: queued.length > 0 
        ? Math.min(...queued.map(l => l.createdAt.getTime()))
        : null,
      isProcessing: this.isProcessing,
    };
  }

  /**
   * Limpa leads que excederam tentativas máximas
   */
  clearMaxedLeads(): number {
    const maxedLeads = this.getAllQueued().filter(
      l => l.attempts >= this.MAX_ATTEMPTS
    );

    maxedLeads.forEach(lead => {
      this.queue.delete(lead.id);

      createErrorLog('queue:maxed_attempts', new Error(lead.error || 'Max attempts reached'), {
        leadId: lead.id,
        leadName: lead.lead.name,
        attempts: lead.attempts,
      });

      // TODO: Enviar notificação de falha após max attempts
      // TODO: Salvar em storage persistente para análise
    });

    if (maxedLeads.length > 0) {
      createLog('queue:cleared_maxed', {
        count: maxedLeads.length,
      });
    }

    return maxedLeads.length;
  }

  /**
   * Processa fila de retry
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      const queued = this.getAllQueued();

      if (queued.length === 0) {
        return;
      }

      createLog('queue:processing', {
        queueSize: queued.length,
      });

      // Filtra leads que estão prontos para retry
      const readyForRetry = queued.filter(lead => {
        if (lead.attempts >= lead.maxAttempts) {
          return false; // Já excedeu max attempts
        }

        if (!lead.lastAttempt) {
          return true; // Nunca tentou
        }

        // Verifica se passou o intervalo de retry
        const timeSinceLastAttempt = Date.now() - lead.lastAttempt.getTime();
        return timeSinceLastAttempt >= this.RETRY_INTERVAL;
      });

      if (readyForRetry.length === 0) {
        return;
      }

      createLog('queue:ready_for_retry', {
        count: readyForRetry.length,
      });

      // Processa cada lead
      const { getC2SLeadProvider } = await import('./C2SLeadProvider');
      const provider = getC2SLeadProvider();

      for (const queuedLead of readyForRetry) {
        try {
          // Tenta enviar para C2S
          const result = await provider.createEnrichedLead(
            queuedLead.lead,
            {
              property: queuedLead.property,
              skipAutoTags: false,
            }
          );

          if (result.success) {
            // Sucesso - remove da fila
            this.removeFromQueue(queuedLead.id);

            createLog('queue:retry_success', {
              id: queuedLead.id,
              attempts: queuedLead.attempts + 1,
              leadId: result.leadId,
            });
          } else {
            // Falhou - incrementa tentativas
            queuedLead.attempts++;
            queuedLead.lastAttempt = new Date();
            queuedLead.error = result.message;

            createLog('queue:retry_failed', {
              id: queuedLead.id,
              attempts: queuedLead.attempts,
              error: result.message,
            });
          }
        } catch (error: any) {
          // Erro - incrementa tentativas
          queuedLead.attempts++;
          queuedLead.lastAttempt = new Date();
          queuedLead.error = error.message;

          createErrorLog('queue:retry_error', error, {
            id: queuedLead.id,
            attempts: queuedLead.attempts,
          });
        }
      }

      // Limpa leads que excederam max attempts
      this.clearMaxedLeads();
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Inicia processamento automático da fila
   */
  private startProcessing(): void {
    if (this.processingInterval) {
      return;
    }

    this.processingInterval = setInterval(() => {
      this.processQueue().catch(error => {
        createErrorLog('queue:process_error', error);
      });
    }, this.QUEUE_PROCESS_INTERVAL);

    createLog('queue:started', {
      processInterval: this.QUEUE_PROCESS_INTERVAL,
      retryInterval: this.RETRY_INTERVAL,
    });
  }

  /**
   * Para processamento automático
   */
  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;

      createLog('queue:stopped', {
        queueSize: this.queue.size,
      });
    }
  }

  /**
   * Gera ID único para lead
   */
  private generateId(lead: LeadInput): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const nameSlug = lead.name.toLowerCase().replace(/\s+/g, '-').substring(0, 20);
    
    return `lead-${nameSlug}-${timestamp}-${random}`;
  }

  /**
   * Limpa toda a fila
   */
  clearAll(): void {
    const size = this.queue.size;
    this.queue.clear();

    createLog('queue:cleared_all', {
      clearedCount: size,
    });
  }
}

/**
 * Instância singleton da fila
 */
let queueInstance: LeadQueue | null = null;

/**
 * Retorna instância da fila (singleton)
 */
export function getLeadQueue(): LeadQueue {
  if (!queueInstance) {
    queueInstance = new LeadQueue();
  }
  return queueInstance;
}

/**
 * Reseta instância da fila (útil para testes)
 */
export function resetLeadQueue(): void {
  if (queueInstance) {
    queueInstance.stopProcessing();
    queueInstance = null;
  }
}

