import type { HookDescriptor } from './hook'

export interface MiddlewareContract {
  readonly name: string
  readonly hooks: readonly HookDescriptor[]
}
