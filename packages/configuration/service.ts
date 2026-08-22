import type { ConfigurationResolver } from './resolver'
import type { ConfigurationValidator } from './validator'
import type { FeatureFlag } from './feature-flag'
import type { FeatureFlagEvaluation, FeatureFlagTarget } from './types'
import type { ConfigurationSnapshot, ConfigurationScope } from './types'

export interface ConfigurationService<T = unknown> {
  load(scope?: ConfigurationScope): Promise<ConfigurationSnapshot<T> | undefined>
  resolve<TValue = unknown>(key: string, scope?: ConfigurationScope): Promise<TValue | undefined>
  merge(snapshot: ConfigurationSnapshot<T>): Promise<ConfigurationSnapshot<T>>
  validate(snapshot: ConfigurationSnapshot<T>): Promise<unknown>
  snapshot(scope?: ConfigurationScope): Promise<ConfigurationSnapshot<T> | undefined>
  compare(leftVersion: string, rightVersion: string): Promise<number>
  rollback(version: string): Promise<ConfigurationSnapshot<T> | undefined>
  publish(snapshot: ConfigurationSnapshot<T>): Promise<void>
  evaluateFeatureFlag(flag: FeatureFlag, target: FeatureFlagTarget): Promise<FeatureFlagEvaluation>
}

export interface ConfigurationPlatformService<T = unknown> extends ConfigurationService<T> {
  readonly resolver?: ConfigurationResolver<T>
  readonly validator?: ConfigurationValidator<T>
}
