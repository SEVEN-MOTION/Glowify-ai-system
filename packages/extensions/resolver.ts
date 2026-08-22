import type { DependencyDeclaration } from './dependency'
import type { VersionConstraint } from './version'

export interface ResolutionRequest {
  readonly dependency: DependencyDeclaration
  readonly constraint?: VersionConstraint
}

export interface ResolutionResult {
  readonly satisfied: boolean
  readonly resolvedVersion?: string
}
