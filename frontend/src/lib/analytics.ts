/**
 * ECHO Privacy-First Analytics Dispatcher
 *
 * Designed to provide a modular integration point for privacy-preserving analytics
 * (e.g., self-hosted Plausible or Umami) without collecting non-essential cookies,
 * personal financial metrics, or user secrets.
 */

type AnalyticsEvent = {
  name: string
  properties?: Record<string, string | number | boolean>
}

class AnalyticsService {
  private enabled: boolean = false
  private endpoint: string | null = null

  constructor() {
    // Analytics is disabled by default until an administrator explicitly configures VITE_ANALYTICS_ENDPOINT
    const configuredEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT
    if (configuredEndpoint && typeof configuredEndpoint === 'string' && configuredEndpoint.trim() !== '') {
      this.enabled = true
      this.endpoint = configuredEndpoint.trim()
    }
  }

  public isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Track high-level navigation or public engagement.
   * Strictly filters out any entity IDs, financial figures, or passwords.
   */
  public trackEvent(event: AnalyticsEvent): void {
    if (!this.enabled || !this.endpoint) {
      return // No-op when unconfigured
    }

    try {
      // Safe sanitized payload
      const payload = {
        event: event.name,
        timestamp: new Date().toISOString(),
        properties: this.sanitizeProperties(event.properties || {}),
      }

      navigator.sendBeacon?.(this.endpoint, JSON.stringify(payload))
    } catch {
      // Fail silently without disrupting user flow
    }
  }

  private sanitizeProperties(props: Record<string, unknown>): Record<string, string | number | boolean> {
    const safe: Record<string, string | number | boolean> = {}
    const forbiddenKeys = ['password', 'token', 'secret', 'key', 'auth', 'email', 'price', 'balance']

    for (const [k, v] of Object.entries(props)) {
      if (forbiddenKeys.some((f) => k.toLowerCase().includes(f))) continue
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
        safe[k] = v
      }
    }
    return safe
  }
}

export const analytics = new AnalyticsService()
