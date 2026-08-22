import type { EventDescriptor } from './event'

export interface HookDescriptor {
  readonly id: string
  readonly event?: EventDescriptor
  readonly description?: string
}
