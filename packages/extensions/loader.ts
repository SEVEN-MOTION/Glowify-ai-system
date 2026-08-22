import type { ExtensionManifest } from './manifest'

export interface LoaderContract {
  readonly manifest: ExtensionManifest
  readonly entrypoint?: string
}
