import type { PermissionDescriptor } from './permission'

export interface SandboxPolicy {
  readonly name: string
  readonly permissions: readonly PermissionDescriptor[]
  readonly allowNetwork?: boolean
  readonly allowFilesystem?: boolean
  readonly allowProcessSpawn?: boolean
}
