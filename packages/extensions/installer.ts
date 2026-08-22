import type { ExtensionManifest } from './manifest'

export interface InstallationRequest {
  readonly manifest: ExtensionManifest
  readonly target?: string
  readonly force?: boolean
}

export interface InstallationContract {
  readonly request: InstallationRequest
  readonly installed: boolean
}
