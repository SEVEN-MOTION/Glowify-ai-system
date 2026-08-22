import type { ExtensionContract } from './extension'
import type { ExtensionManifest } from './manifest'

export interface ExtensionRepository {
  readonly findById: (id: string) => Promise<ExtensionContract | null>
  readonly findManifestById: (id: string) => Promise<ExtensionManifest | null>
}
