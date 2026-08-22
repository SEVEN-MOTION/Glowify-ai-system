import type { CapabilityDescriptor } from './capability'
import type { ExtensionManifest } from './manifest'
import type { ExtensionMetadata } from './metadata'
import type { DependencyDeclaration } from './dependency'

export interface ExtensionContract {
  readonly id: string
  readonly manifest: ExtensionManifest
  readonly metadata: ExtensionMetadata
  readonly capabilities: readonly CapabilityDescriptor[]
  readonly dependencies: readonly DependencyDeclaration[]
}
