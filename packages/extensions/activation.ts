import type { ExtensionLifecycleState } from './lifecycle'

export interface ActivationRequest {
  readonly extensionId: string
  readonly currentState: ExtensionLifecycleState
}

export interface ActivationResult {
  readonly activated: boolean
  readonly nextState: ExtensionLifecycleState
}
