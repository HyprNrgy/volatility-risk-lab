export type AlertType = 'volatility' | 'sentiment' | 'portfolio_risk';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface AlertConfig {
  volatilityEnabled: boolean;
  volatilityThreshold: number; // percentage, e.g., 25
  sentimentEnabled: boolean;
  sentimentThreshold: number;  // score 0-100, e.g., 40
  portfolioRiskEnabled: boolean;
  portfolioRiskThreshold: number; // percentage, e.g., 15
}

export interface AlertEvent {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  timestamp: number;
}

/**
 * Event-based Alert System
 * Designed to be modular so it can easily emit to webhooks, email, or push notifications later.
 */
class AlertSystem {
  private config: AlertConfig;
  private history: AlertEvent[] = [];
  private listeners: ((event: AlertEvent) => void)[] = [];

  constructor(defaultConfig: AlertConfig) {
    this.config = defaultConfig;
  }

  updateConfig(newConfig: Partial<AlertConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig() {
    return this.config;
  }

  getHistory() {
    return this.history;
  }

  clearHistory() {
    this.history = [];
    this.notifyUpdate();
  }

  subscribe(listener: (event: AlertEvent) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
  
  // This notifies listeners of general state changes (like cleared history)
  private notifyUpdate() {
    const dummyEvent: AlertEvent = { id: 'update', type: 'volatility', severity: 'info', message: 'update', timestamp: 0 };
    this.listeners.forEach(l => l(dummyEvent));
  }

  // --- TRIGGERS ---

  evaluateVolatility(assetName: string, currentVol: number) {
    if (!this.config.volatilityEnabled) return;
    
    if (currentVol > this.config.volatilityThreshold) {
      const isCritical = currentVol > this.config.volatilityThreshold * 1.5;
      this.dispatch({
        type: 'volatility',
        severity: isCritical ? 'critical' : 'warning',
        message: `${assetName} volatility spiked to ${currentVol.toFixed(1)}%. (Threshold: ${this.config.volatilityThreshold}%)`,
      });
    }
  }

  evaluateSentiment(assetName: string, currentSentiment: number) {
    if (!this.config.sentimentEnabled) return;

    if (currentSentiment < this.config.sentimentThreshold) {
      const isCritical = currentSentiment < this.config.sentimentThreshold / 2;
      this.dispatch({
        type: 'sentiment',
        severity: isCritical ? 'critical' : 'warning',
        message: `${assetName} sentiment dropped to ${currentSentiment.toFixed(0)}. (Threshold: ${this.config.sentimentThreshold})`,
      });
    }
  }

  evaluatePortfolioRisk(currentRisk: number) {
    if (!this.config.portfolioRiskEnabled) return;

    if (currentRisk > this.config.portfolioRiskThreshold) {
      const isCritical = currentRisk > this.config.portfolioRiskThreshold * 1.5;
      this.dispatch({
        type: 'portfolio_risk',
        severity: isCritical ? 'critical' : 'warning',
        message: `Portfolio risk exceeded limits at ${currentRisk.toFixed(1)}%. (Threshold: ${this.config.portfolioRiskThreshold}%)`,
      });
    }
  }

  private dispatch(eventPartial: Omit<AlertEvent, 'id' | 'timestamp'>) {
    const event: AlertEvent = {
      ...eventPartial,
      id: Math.random().toString(36).substring(2, 10),
      timestamp: Date.now(),
    };

    this.history.unshift(event);
    
    // Future expansion: POST to email service or push notification API here
    // e.g., await fetch('/api/notify', { body: JSON.stringify(event) }) 

    this.listeners.forEach((l) => l(event));
  }
}

// Global instance for client-side state
export const alertsEngine = new AlertSystem({
  volatilityEnabled: true,
  volatilityThreshold: 25,
  sentimentEnabled: true,
  sentimentThreshold: 45,
  portfolioRiskEnabled: true,
  portfolioRiskThreshold: 15,
});
