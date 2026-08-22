import type { CapabilityDescriptor } from './capability'
import type { ExtensionMetadata } from './metadata'

export interface ModuleContract {
  readonly id: string
  readonly metadata: ExtensionMetadata
  readonly capabilities: readonly CapabilityDescriptor[]
}
