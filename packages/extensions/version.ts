import type { SemVerRange } from './types'

export type VersionConstraint = SemVerRange

export interface VersionDescriptor {
  readonly version: string
  readonly range?: SemVerRange
}
