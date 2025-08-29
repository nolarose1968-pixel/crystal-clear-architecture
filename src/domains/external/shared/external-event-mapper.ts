/**
 * External Event Mapper
 * Domain-Driven Design Implementation
 *
 * Maps external system events to internal domain events
 */

import { DomainEvents } from '../shared/events/domain-events';

export interface ExternalEvent {
  eventType: string;
  eventId: string;
  source: string;
  timestamp: Date;
  payload: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface InternalEvent {
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  payload: Record<string, any>;
  metadata?: {
    userId?: string;
    sessionId?: string;
    correlationId?: string;
    causationId?: string;
    externalEventId?: string;
    externalSource?: string;
  };
}

export class ExternalEventMapper {
  private eventMappings: Map<string, (externalEvent: ExternalEvent) => InternalEvent[]> = new Map();
  private eventPublisher: DomainEvents;

  constructor(eventPublisher: DomainEvents) {
    this.eventPublisher = eventPublisher;
    this.setupDefaultMappings();
  }

  /**
   * Register a mapping from external event type to internal events
   */
  registerMapping(
    externalEventType: string,
    mapper: (externalEvent: ExternalEvent) => InternalEvent[]
  ): void {
    this.eventMappings.set(externalEventType, mapper);
  }

  /**
   * Process an external event and publish corresponding internal events
   */
  async processExternalEvent(externalEvent: ExternalEvent): Promise<void> {
    try {
      const mapper = this.eventMappings.get(externalEvent.eventType);

      if (!mapper) {
        console.warn(`No mapping found for external event type: ${externalEvent.eventType}`);
        return;
      }

      const internalEvents = mapper(externalEvent);

      // Publish all mapped internal events
      for (const internalEvent of internalEvents) {
        // Add external event metadata to internal event
        const enrichedEvent = {
          ...internalEvent,
          metadata: {
            ...internalEvent.metadata,
            externalEventId: externalEvent.eventId,
            externalSource: externalEvent.source,
            externalTimestamp: externalEvent.timestamp.toISOString()
          }
        };

        await this.eventPublisher.publish(internalEvent.eventType, enrichedEvent);
      }

      console.log(`✅ Processed external event: ${externalEvent.eventType} -> ${internalEvents.length} internal events`);

    } catch (error) {
      console.error(`❌ Failed to process external event ${externalEvent.eventType}:`, error);
      throw error;
    }
  }

  /**
   * Set up default event mappings for common external events
   */
  private setupDefaultMappings(): void {
    // Fantasy402 Event Mappings
    this.registerMapping('fantasy402.sport_event.started', (external) => [
      {
        eventType: 'external.sport_event.live',
        aggregateId: external.payload.eventId,
        aggregateType: 'SportEvent',
        payload: {
          externalId: external.payload.eventId,
          sport: external.payload.sport,
          league: external.payload.league,
          homeTeam: external.payload.home_team,
          awayTeam: external.payload.away_team,
          startTime: external.payload.start_time
        },
        metadata: {
          correlationId: external.eventId,
          externalSource: 'fantasy402'
        }
      }
    ]);

    this.registerMapping('fantasy402.sport_event.completed', (external) => [
      {
        eventType: 'external.sport_event.completed',
        aggregateId: external.payload.eventId,
        aggregateType: 'SportEvent',
        payload: {
          externalId: external.payload.eventId,
          finalScore: external.payload.final_score,
          winner: external.payload.winner
        },
        metadata: {
          correlationId: external.eventId,
          externalSource: 'fantasy402'
        }
      }
    ]);

    this.registerMapping('fantasy402.bet.placed', (external) => [
      {
        eventType: 'external.bet.received',
        aggregateId: external.payload.betId,
        aggregateType: 'Bet',
        payload: {
          externalId: external.payload.betId,
          agentId: external.payload.agentId,
          eventId: external.payload.eventId,
          amount: external.payload.amount,
          odds: external.payload.odds,
          betType: external.payload.betType
        },
        metadata: {
          correlationId: external.eventId,
          externalSource: 'fantasy402'
        }
      }
    ]);

    this.registerMapping('fantasy402.bet.settled', (external) => [
      {
        eventType: 'external.bet.settled',
        aggregateId: external.payload.betId,
        aggregateType: 'Bet',
        payload: {
          externalId: external.payload.betId,
          result: external.payload.result,
          payout: external.payload.payout,
          settledAt: external.payload.settled_at
        },
        metadata: {
          correlationId: external.eventId,
          externalSource: 'fantasy402'
        }
      }
    ]);

    this.registerMapping('fantasy402.agent.balance_changed', (external) => [
      {
        eventType: 'external.agent.balance_updated',
        aggregateId: external.payload.agentId,
        aggregateType: 'AgentAccount',
        payload: {
          agentId: external.payload.agentId,
          previousBalance: external.payload.previous_balance,
          newBalance: external.payload.new_balance,
          changeAmount: external.payload.change_amount,
          reason: external.payload.reason
        },
        metadata: {
          correlationId: external.eventId,
          externalSource: 'fantasy402'
        }
      }
    ]);

    // Telegram Event Mappings (placeholders for future implementation)
    this.registerMapping('telegram.message.received', (external) => [
      {
        eventType: 'external.message.received',
        aggregateId: external.payload.messageId,
        aggregateType: 'Message',
        payload: {
          senderId: external.payload.sender_id,
          chatId: external.payload.chat_id,
          text: external.payload.text,
          timestamp: external.payload.timestamp
        },
        metadata: {
          correlationId: external.eventId,
          externalSource: 'telegram'
        }
      }
    ]);
  }

  /**
   * Get all registered external event types
   */
  getRegisteredExternalEventTypes(): string[] {
    return Array.from(this.eventMappings.keys());
  }

  /**
   * Get mapping for a specific external event type
   */
  getMapping(externalEventType: string): ((externalEvent: ExternalEvent) => InternalEvent[]) | undefined {
    return this.eventMappings.get(externalEventType);
  }

  /**
   * Remove a mapping
   */
  removeMapping(externalEventType: string): boolean {
    return this.eventMappings.delete(externalEventType);
  }

  /**
   * Clear all mappings
   */
  clearMappings(): void {
    this.eventMappings.clear();
  }
}
