/**
 * Feature Flags Management
 * Enables/disables features without redeploying the application
 * Uses Redis for distributed flag management
 */

import type { Redis } from 'ioredis';

type FeatureFlag =
  | 'FEATURE_AI_ADVISOR'
  | 'FEATURE_LIVE_PRICING'
  | 'FEATURE_PRICE_ALERTS'
  | 'FEATURE_TRADING'
  | 'FEATURE_RECOMMENDATIONS';

interface FeatureFlagConfig {
  name: FeatureFlag;
  enabled: boolean;
  description?: string;
}

/**
 * Feature Flags Manager
 * Manages feature toggles with Redis backend and fallback to env vars
 */
export class FeatureFlagsManager {
  private redis: Redis | null = null;
  private localCache: Map<FeatureFlag, boolean> = new Map();
  private enabled: boolean;
  private prefix = 'feature:';

  constructor(redis?: Redis) {
    this.redis = redis || null;
    this.enabled = process.env.FEATURE_FLAGS_ENABLED === 'true';
    this.initializeFromEnv();
  }

  /**
   * Initialize feature flags from environment variables
   */
  private initializeFromEnv(): void {
    const flags: FeatureFlag[] = [
      'FEATURE_AI_ADVISOR',
      'FEATURE_LIVE_PRICING',
      'FEATURE_PRICE_ALERTS',
      'FEATURE_TRADING',
      'FEATURE_RECOMMENDATIONS',
    ];

    for (const flag of flags) {
      const value = process.env[flag] === 'true';
      this.localCache.set(flag, value);
    }
  }

  /**
   * Check if a feature is enabled
   * @param flag - Feature flag name
   * @returns Promise<boolean> - true if feature is enabled
   */
  async isEnabled(flag: FeatureFlag): Promise<boolean> {
    if (!this.enabled) {
      return this.localCache.get(flag) ?? false;
    }

    try {
      if (this.redis) {
        const redisValue = await this.redis.get(this.prefix + flag);
        if (redisValue !== null) {
          const enabled = redisValue === 'true';
          this.localCache.set(flag, enabled);
          return enabled;
        }
      }
    } catch (error) {
      console.warn(`[FeatureFlags] Redis error for ${flag}:`, error);
    }

    // Fallback to local cache or env var
    return this.localCache.get(flag) ?? false;
  }

  /**
   * Set a feature flag value
   * @param flag - Feature flag name
   * @param enabled - Enable or disable the flag
   */
  async setFlag(flag: FeatureFlag, enabled: boolean): Promise<void> {
    this.localCache.set(flag, enabled);

    if (this.enabled && this.redis) {
      try {
        await this.redis.set(
          this.prefix + flag,
          enabled ? 'true' : 'false',
          'EX',
          86400 // 24 hours TTL
        );
        console.log(`[FeatureFlags] ${flag} set to ${enabled}`);
      } catch (error) {
        console.error(`[FeatureFlags] Failed to set ${flag}:`, error);
      }
    }
  }

  /**
   * Get all feature flags
   */
  async getAllFlags(): Promise<Record<FeatureFlag, boolean>> {
    const flags: FeatureFlag[] = [
      'FEATURE_AI_ADVISOR',
      'FEATURE_LIVE_PRICING',
      'FEATURE_PRICE_ALERTS',
      'FEATURE_TRADING',
      'FEATURE_RECOMMENDATIONS',
    ];

    const result: Record<FeatureFlag, boolean> = {} as Record<FeatureFlag, boolean>;

    for (const flag of flags) {
      result[flag] = await this.isEnabled(flag);
    }

    return result;
  }

  /**
   * Reset all flags to environment defaults
   */
  async resetToDefaults(): Promise<void> {
    if (this.enabled && this.redis) {
      try {
        const keys = await this.redis.keys(this.prefix + '*');
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } catch (error) {
        console.error('[FeatureFlags] Failed to reset to defaults:', error);
      }
    }
    this.initializeFromEnv();
  }

  /**
   * Enable fallback mode for graceful degradation
   * Disables non-essential services
   */
  async enableFallbackMode(): Promise<void> {
    console.warn('[FeatureFlags] Enabling fallback mode - non-essential services disabled');
    await this.setFlag('FEATURE_AI_ADVISOR', false);
    await this.setFlag('FEATURE_LIVE_PRICING', false);
    await this.setFlag('FEATURE_RECOMMENDATIONS', false);
  }
}

/**
 * Global feature flags instance
 */
let globalFlagsManager: FeatureFlagsManager | null = null;

/**
 * Get or create the global feature flags manager
 */
export function getFeatureFlagsManager(redis?: Redis): FeatureFlagsManager {
  if (!globalFlagsManager) {
    globalFlagsManager = new FeatureFlagsManager(redis);
  }
  return globalFlagsManager;
}

/**
 * Helper function to check if a feature is enabled
 */
export async function isFeatureEnabled(flag: FeatureFlag, redis?: Redis): Promise<boolean> {
  const manager = getFeatureFlagsManager(redis);
  return manager.isEnabled(flag);
}
