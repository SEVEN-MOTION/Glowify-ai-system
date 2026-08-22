import type { AuthorizationContext, AccessEffect, PolicyId } from './types'
import type { Scope } from './scope'

export interface Policy {
  readonly policyId: PolicyId
  readonly name: string
  readonly description?: string
  readonly effect: AccessEffect
  readonly actions?: ReadonlyArray<string>
  readonly resources?: ReadonlyArray<string>
  readonly subjects?: ReadonlyArray<string>
  readonly scopes?: ReadonlyArray<Scope>
  readonly conditions?: ReadonlyArray<PolicyCondition>
  readonly inherited?: boolean
  readonly wildcard?: boolean
  readonly featureGate?: string
  readonly metadata?: Readonly<Record<string, unknown>>
}

export interface PolicyCondition {
  readonly key: string
  readonly operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'startsWith' | 'endsWith' | 'exists'
  readonly value?: unknown
}

export interface PolicyEvaluationResult {
  readonly policy: Policy
  readonly matched: boolean
  readonly reason?: string
}

export interface PolicyEvaluator {
  evaluate(context: AuthorizationContext, policies: ReadonlyArray<Policy>): Promise<ReadonlyArray<PolicyEvaluationResult>>
}

export interface PolicyEngine {
  resolvePolicies(context: AuthorizationContext): Promise<ReadonlyArray<Policy>>
  resolveScopes(context: AuthorizationContext): Promise<ReadonlyArray<Scope>>
  resolvePermissions(context: AuthorizationContext): Promise<ReadonlyArray<string>>
  resolveInheritance(context: AuthorizationContext): Promise<ReadonlyArray<Policy>>
  evaluate(context: AuthorizationContext): Promise<ReadonlyArray<PolicyEvaluationResult>>
}
