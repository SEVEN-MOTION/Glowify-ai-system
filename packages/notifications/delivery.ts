import type { NotificationChannelName } from './types'
import type { NotificationMetadata } from './types'

export interface DeliveryRecord {
  readonly metadata: NotificationMetadata
  readonly channel: NotificationChannelName
  readonly status: string
  readonly provider?: string
  readonly messageId?: string
  readonly deliveredAt?: string
  readonly metadataTrace?: Readonly<Record<string, unknown>>
}

export interface DeliveryTracker {
  track(record: DeliveryRecord): Promise<DeliveryRecord>
  history(notificationId: string): Promise<ReadonlyArray<DeliveryRecord>>
}
