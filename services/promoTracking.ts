import { generateSessionId } from '@/utils/session';
import { getAuthToken } from '@/utils/auth';

interface PromoAnalyticsEvent {
  entity_type: 'campaign' | 'voucher' | 'banner';
  entity_id: string;
  event_type: 'impression' | 'click' | 'conversion';
  source_screen?: string;
  metadata?: Record<string, any>;
  occurred_at?: string;
}

interface PromoAnalyticsBatch {
  session_id?: string;
  events: PromoAnalyticsEvent[];
}

const MAX_BATCH_SIZE = 50;
const FLUSH_INTERVAL_MS = 30000; // 30 seconds

let eventQueue: PromoAnalyticsEvent[] = [];
let flushTimeout: NodeJS.Timeout | null = null;
const sessionId = generateSessionId();
let isEnabled = true;

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export async function configurePromoTracking(config: {
  enabled: boolean;
  getAccessToken?: () => Promise<string | null>;
}) {
  isEnabled = config.enabled;
}

function shouldIncludeUserContext(): boolean {
  // Batching/deduplication happens here. For now, always include optional user context.
  return true;
}

async function flushPromoEvents() {
  if (eventQueue.length === 0) {
    return;
  }

  const eventsToSend = eventQueue.splice(0, eventQueue.length);

  try {
    const batch: PromoAnalyticsBatch = {
      session_id: sessionId,
      events: eventsToSend,
    };

    const token = shouldIncludeUserContext() ? await getAuthToken() : null;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/promotions/events/batch`, {
      method: 'POST',
      headers,
      body: JSON.stringify(batch),
    });

    if (!response.ok) {
      console.error('Promo analytics batch failed:', response.status);
      // Re-queue failed events for retry
      eventQueue.unshift(...eventsToSend);
    }
  } catch (error) {
    console.error('Promo tracking error:', error);
    // Re-queue failed events for retry
    eventQueue.unshift(...eventsToSend);
  }
}

function scheduleFlusher() {
  if (flushTimeout) {
    clearTimeout(flushTimeout);
  }
  flushTimeout = setTimeout(() => {
    flushPromoEvents();
  }, FLUSH_INTERVAL_MS);
}

export async function trackPromoImpression(params: {
  entityType: 'campaign' | 'voucher' | 'banner';
  entityId: string;
  sourceScreen?: string;
}) {
  if (!isEnabled) return;

  eventQueue.push({
    entity_type: params.entityType,
    entity_id: params.entityId,
    event_type: 'impression',
    source_screen: params.sourceScreen,
    occurred_at: new Date().toISOString(),
  });

  if (eventQueue.length >= MAX_BATCH_SIZE) {
    await flushPromoEvents();
  } else {
    scheduleFlusher();
  }
}

export async function trackPromoClick(params: {
  entityType: 'campaign' | 'voucher' | 'banner';
  entityId: string;
  sourceScreen?: string;
}) {
  if (!isEnabled) return;

  eventQueue.push({
    entity_type: params.entityType,
    entity_id: params.entityId,
    event_type: 'click',
    source_screen: params.sourceScreen,
    occurred_at: new Date().toISOString(),
  });

  if (eventQueue.length >= MAX_BATCH_SIZE) {
    await flushPromoEvents();
  } else {
    scheduleFlusher();
  }
}

export async function trackPromoConversion(params: {
  entityType: 'campaign' | 'voucher' | 'banner';
  entityId: string;
  sourceScreen?: string;
  metadata?: Record<string, any>;
}) {
  if (!isEnabled) return;

  eventQueue.push({
    entity_type: params.entityType,
    entity_id: params.entityId,
    event_type: 'conversion',
    source_screen: params.sourceScreen,
    metadata: params.metadata,
    occurred_at: new Date().toISOString(),
  });

  if (eventQueue.length >= MAX_BATCH_SIZE) {
    await flushPromoEvents();
  } else {
    scheduleFlusher();
  }
}

export async function flushAndReset() {
  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }
  await flushPromoEvents();
}
