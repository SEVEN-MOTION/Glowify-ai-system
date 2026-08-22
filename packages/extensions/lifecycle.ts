export enum ExtensionLifecycleState {
  Discovered = 'discovered',
  Registered = 'registered',
  Installed = 'installed',
  Activated = 'activated',
  Deactivated = 'deactivated',
  Removed = 'removed',
}

export interface LifecycleTransition {
  readonly from: ExtensionLifecycleState
  readonly to: ExtensionLifecycleState
  readonly reason?: string
}
