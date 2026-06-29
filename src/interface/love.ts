export interface LoveEntry {
  id: number
  slug: string
  title: string
  date: string
  location: string
  mood: string
  visibility: 'public' | 'hidden' | 'private'
  cover: string
  content: string
  longitude?: number | null
  latitude?: number | null
  footprintType?: string
}

export interface FootprintCategory {
  id: number
  name: string
  code: string
  icon: string
  createTime?: string
  updateTime?: string
}

export interface BucketItem {
  id: number
  title: string
  completed: boolean
  completedDate?: string
  cover?: string
  thoughts?: string
  category: 'travel' | 'food' | 'daily' | 'adventure'
}

export interface TimeCapsule {
  id: number
  sender: string;
  receiver: string;
  writeDate: string;
  openDate: string;
  title: string;
  content: string;
}

export interface LoveStats {
  startDate: number
  citiesCount: number
  flightDistance: number
  movieCount: number
  mealCount: number
}

export interface AtmosphereItem {
  id: string
  name: string
  src: string
  type: 'video' | 'image'
}

export interface Category {
  id: number
  name: string
  slug: string
  parentId: number
  icon: string
  createTime?: string
  updateTime?: string
}

export interface Achievement {
  id: number
  title: string
  description: string
  category: string
  level: string
  achieveDate: string
  cover?: string
  icon?: string
  createTime?: string
  updateTime?: string
}

export interface AchievementMeta {
  id: number
  type: 'category' | 'level'
  name: string
  code: string
  icon: string
  createTime?: string
  updateTime?: string
}

export interface Blog {
  id: number
  slug: string
  title: string
  summary: string
  content: string
  views: number
  tags: string
  category: string
  categoryId?: string | number | null
  mood: string
  visibility: string
  cover: string
  createTime: string
}

export interface GalleryPhoto {
  id: number
  slug: string
  title: string
  date: string
  camera: string
  lens: string
  filmStock: string
  settings: string
  location: string
  src: string
  description: string
  type: string
  longitude?: number | null
  latitude?: number | null
  footprintType?: string
}

export interface Note {
  id: number
  content: string
  mood?: string
  createTime?: string
  date?: string
}

export interface FeedbackTag {
  id: number
  name: string
  color: string
}

export interface FeedbackReply {
  id: number
  nickname: string
  avatar: string
  content: string
  isAdmin: boolean
  createdAt: string
}

export interface Feedback {
  id: number
  nickname: string
  avatar?: string
  email?: string
  website?: string
  content: string
  source: string
  category: string
  status: string
  isPublic: boolean
  isPinned: boolean
  isFeatured: boolean
  isAnonymous: boolean
  likeCount: number
  replyCount: number
  viewCount: number
  adopted: boolean
  adoptedNote?: string
  adoptedAt?: string
  ip?: string
  createdAt: string
  tags?: FeedbackTag[]
  replies?: FeedbackReply[]
}






