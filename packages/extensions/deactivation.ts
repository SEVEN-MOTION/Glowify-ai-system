import type { ExtensionLifecycleState } from './lifecycle'

export interface DeactivationRequest {
  readonly extensionId: string
  readonly currentState: ExtensionLifecycleState
}

export interface DeactivationResult {
  readonly deactivated: boolean
  readonly nextState: ExtensionLifecycleState
}
