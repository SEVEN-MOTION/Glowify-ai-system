import type { VersionDescriptor } from './version'

export interface CompatibilityRule {
  readonly subject: string
  readonly target: string
  readonly compatible: boolean
  readonly reason?: string
  readonly versions?: readonly VersionDescriptor[]
}
