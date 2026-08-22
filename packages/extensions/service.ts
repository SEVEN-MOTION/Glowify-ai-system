import type { ExtensionContract } from './extension'

export interface ExtensionService {
  readonly register: (extension: ExtensionContract) => Promise<void>
  readonly unregister: (extensionId: string) => Promise<void>
}
