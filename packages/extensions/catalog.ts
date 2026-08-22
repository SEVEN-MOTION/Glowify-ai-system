import type { ExtensionManifest } from './manifest'

export interface CatalogEntry {
  readonly id: string
  readonly manifest: ExtensionManifest
  readonly source?: string
}

export interface ExtensionCatalog {
  readonly name: string
  readonly entries: readonly CatalogEntry[]
}
