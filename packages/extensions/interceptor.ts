import type { EventDescriptor } from './event'

export interface InterceptorContract {
  readonly name: string
  readonly events: readonly EventDescriptor[]
}
