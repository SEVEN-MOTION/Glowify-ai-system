import type { PermissionSet } from './permission'
import type { Policy } from './policy'

export type TenantId = string
export type OrganizationId = string
export type TeamId = string
export type UserId = string
export type ResourceId = string
export type ResourceType = string
export type Action = string
export type PermissionName = string
export type RoleName = string
export type PolicyId = string
export type ScopeId = string
export type Timestamp = string

export type AccessEffect = 'allow' | 'deny'
export type AccessDecision = 'allow' | 'deny' | 'inherit' | 'neutral'
export type PermissionResolutionMode = 'explicit' | 'inherited' | 'wildcard' | 'conditional'

export interface AuthorizationMetadata {
  readonly tenantId?: TenantId
  readonly organizationId?: OrganizationId
  readonly teamId?: TeamId
  readonly userId?: UserId
  readonly resourceId?: ResourceId
  readonly resourceType?: ResourceType
  readonly permission?: PermissionName
  readonly action?: Action
  readonly ownership?: boolean
  readonly environment?: string
  readonly timestamp?: Timestamp
}

export interface Identity {
  readonly userId: UserId
  readonly tenantId?: TenantId
  readonly organizationId?: OrganizationId
  readonly teamId?: TeamId
  readonly roles?: ReadonlyArray<RoleName>
  readonly permissions?: PermissionSet
  readonly attributes?: Readonly<Record<string, unknown>>
}

export interface Subject extends Identity {
  readonly subjectId?: string
}

export interface Principal extends Subject {
  readonly principalType?: 'user' | 'service' | 'system' | 'agent' | string
}

export interface Resource {
  readonly resourceId: ResourceId
  readonly resourceType: ResourceType
  readonly tenantId?: TenantId
  readonly organizationId?: OrganizationId
  readonly teamId?: TeamId
  readonly ownerId?: UserId
  readonly attributes?: Readonly<Record<string, unknown>>
}

export interface AuthorizationContext {
  readonly principal: Principal
  readonly resource?: Resource
  readonly action: Action
  readonly metadata?: AuthorizationMetadata
  readonly environment?: Readonly<Record<string, unknown>>
}

export interface AuthorizationResult {
  readonly decision: AccessDecision
  readonly grantedPermissions?: ReadonlyArray<PermissionName>
  readonly deniedPermissions?: ReadonlyArray<PermissionName>
  readonly matchedPolicies?: ReadonlyArray<Policy>
  readonly reason?: string
  readonly metadata?: AuthorizationMetadata
}
