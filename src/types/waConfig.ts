export type WANotificationType =
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'abandoned_cart'
  | 'reward_earned'
  | 'tier_unlocked'
  | 'drop_alert'
  | 'new_order_admin'
  | 'form_filled_admin'
  | 'low_stock_admin'

export interface WAConfig {
  adminPhone: string
  enabledCustomerTypes: WANotificationType[]
  enabledAdminTypes: WANotificationType[]
}

export const DEFAULT_WA_CONFIG: WAConfig = {
  adminPhone: '50624247171',
  enabledCustomerTypes: ['order_confirmed', 'order_shipped', 'order_delivered'],
  enabledAdminTypes: ['new_order_admin', 'form_filled_admin'],
}
