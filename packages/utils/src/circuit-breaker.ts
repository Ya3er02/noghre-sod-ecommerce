/**
 * Circuit Breaker Implementation
 * Prevents cascading failures by stopping requests to failing services
 * States: CLOSED (normal) -> OPEN (failing) -> HALF_OPEN (recovering) -> CLOSED
 */

type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening
  timeout: number; // Time in ms before attempting half-open
  resetTimeout: number; // Time in ms to reset after recovery
  name: string;
}

interface CircuitBreakerMetrics {
  successCount: number;
  failureCount: number;
  lastFailureTime: number | null;
  stateChangedAt: number;
}

/**
 * Circuit Breaker Class
 * Wraps async operations and manages failure states
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = 'CLOSED';
  private metrics: CircuitBreakerMetrics = {
    successCount: 0,
    failureCount: 0,
    lastFailureTime: null,
    stateChangedAt: Date.now(),
  };
  private config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  /**
   * Execute a function with circuit breaker protection
   * @param fn - Async function to execute
   * @throws CircuitBreakerOpenError if circuit is OPEN
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
        console.log(`[CircuitBreaker ${this.config.name}] State: HALF_OPEN`);
      } else {
        throw new CircuitBreakerOpenError(
          `Circuit breaker "${this.config.name}" is OPEN`
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Check if enough time has passed to attempt recovery
   */
  private shouldAttemptReset(): boolean {
    const timeSinceLastFailure = Date.now() - (this.metrics.lastFailureTime || 0);
    return timeSinceLastFailure >= this.config.timeout;
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.metrics.successCount++;

    if (this.state === 'HALF_OPEN') {
      console.log(
        `[CircuitBreaker ${this.config.name}] Recovered successfully. State: CLOSED`
      );
      this.state = 'CLOSED';
      this.metrics.successCount = 0;
      this.metrics.failureCount = 0;
      this.metrics.stateChangedAt = Date.now();
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.metrics.failureCount++;
    this.metrics.lastFailureTime = Date.now();

    if (this.metrics.failureCount >= this.config.failureThreshold) {
      if (this.state !== 'OPEN') {
        console.error(
          `[CircuitBreaker ${this.config.name}] Threshold exceeded. State: OPEN`
        );
        this.state = 'OPEN';
        this.metrics.stateChangedAt = Date.now();
      }
    }
  }

  /**
   * Get current state and metrics
   */
  getStatus(): { state: CircuitBreakerState; metrics: CircuitBreakerMetrics } {
    return { state: this.state, metrics: this.metrics };
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.state = 'CLOSED';
    this.metrics = {
      successCount: 0,
      failureCount: 0,
      lastFailureTime: null,
      stateChangedAt: Date.now(),
    };
    console.log(`[CircuitBreaker ${this.config.name}] Manually reset`);
  }
}

/**
 * Custom error for open circuit breaker
 */
export class CircuitBreakerOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
  }
}

/**
 * Factory function to create circuit breakers with default config
 */
export function createCircuitBreaker(
  name: string,
  threshold = parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD || '5'),
  timeout = parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '60000'),
  resetTimeout = parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT || '30000')
): CircuitBreaker {
  return new CircuitBreaker({ name, failureThreshold: threshold, timeout, resetTimeout });
}
