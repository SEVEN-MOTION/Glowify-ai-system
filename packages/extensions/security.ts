import type { SandboxPolicy } from './sandbox'

export interface SecurityPolicy {
  readonly name: string
  readonly sandbox: SandboxPolicy
  readonly signed?: boolean
  readonly trustedPublisher?: string
}
