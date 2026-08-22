import type { CatalogEntry } from './catalog'
import type { ExtensionContract } from './extension'

export interface ExtensionRegistry {
  readonly entries: readonly CatalogEntry[]
  readonly extensions: readonly ExtensionContract[]
}
