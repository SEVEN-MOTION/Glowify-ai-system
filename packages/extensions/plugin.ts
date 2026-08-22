import type { CapabilityDescriptor } from './capability'
import type { DependencyDeclaration } from './dependency'
import type { ExtensionMetadata } from './metadata'

export interface PluginContract {
  readonly id: string
  readonly metadata: ExtensionMetadata
  readonly capabilities: readonly CapabilityDescriptor[]
  readonly dependencies: readonly DependencyDeclaration[]
}
