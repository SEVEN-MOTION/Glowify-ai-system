import type { SemVerRange } from './types'

export interface DependencyDeclaration {
  readonly name: string
  readonly versionRange: SemVerRange
  readonly optional?: boolean
  readonly peer?: boolean
}
