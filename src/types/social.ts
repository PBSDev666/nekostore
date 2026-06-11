export interface SocialCampaign {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  objective: 'awareness' | 'engagement' | 'sales'
  status: 'draft' | 'active' | 'paused' | 'finished'
  createdAt: string
}

export interface SocialPost {
  id: string
  campaignId: string
  title: string
  text: string
  images: string[]
  platform: 'facebook' | 'instagram' | 'both'
  scheduledAt: string | null
  publishedAt: string | null
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  facebookPostId: string | null
  instagramPostId: string | null
  createdAt: string
}

export interface EngagementMetrics {
  reach: number
  impressions: number
  likes: number
  comments: number
  shares: number
  date: string
}

export interface PostAnalytics {
  postId: string
  metrics: EngagementMetrics[]
}

export interface SocialAsset {
  id: string
  name: string
  dataUrl: string
  campaignId: string | null
  createdAt: string
}

export interface SocialConnection {
  connected: boolean
  pageId: string | null
  pageName: string | null
  accessToken: string | null
  instagramConnected: boolean
}

export interface SocialState {
  connection: SocialConnection
  campaigns: SocialCampaign[]
  posts: SocialPost[]
  postAnalytics: Record<string, PostAnalytics>
  assets: SocialAsset[]
}

export const DEFAULT_SOCIAL_STATE: SocialState = {
  connection: {
    connected: false,
    pageId: null,
    pageName: null,
    accessToken: null,
    instagramConnected: false,
  },
  campaigns: [],
  posts: [],
  postAnalytics: {},
  assets: [],
}

export const SOCIAL_CAMPAIGN_OBJECTIVES: SocialCampaign['objective'][] = [
  'awareness',
  'engagement',
  'sales',
]

export const SOCIAL_POST_PLATFORMS: SocialPost['platform'][] = ['facebook', 'instagram', 'both']

export const SOCIAL_CAMPAIGN_STATUSES: SocialCampaign['status'][] = [
  'draft',
  'active',
  'paused',
  'finished',
]

export const SOCIAL_POST_STATUSES: SocialPost['status'][] = [
  'draft',
  'scheduled',
  'published',
  'failed',
]
