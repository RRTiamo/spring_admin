export interface FriendLink {
  id?: number
  title: string
  url: string
  logo?: string
  description?: string
  category?: string
  sortOrder?: number
  visibility?: 'public' | 'private'
  createTime?: string
  updateTime?: string
}
