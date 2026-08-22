import type { VersionString } from './types'

export interface ExtensionMetadata {
  readonly name: string
  readonly description?: string
  readonly author?: string
  readonly homepage?: string
  readonly license?: string
  readonly version: VersionString
  readonly tags: readonly string[]
}
