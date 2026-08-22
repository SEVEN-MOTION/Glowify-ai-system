import type { CatalogEntry } from './catalog'

export interface DiscoveryResult {
  readonly found: boolean
  readonly entries: readonly CatalogEntry[]
  readonly provider?: string
}
