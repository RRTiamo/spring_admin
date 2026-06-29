import type { FriendLink } from '../interface/links'

export const mockFriendLinks: FriendLink[] = [
  {
    id: 1,
    title: 'RRTiamo',
    url: 'https://github.com/RRTiamo',
    logo: 'https://avatars.githubusercontent.com/u/123456?v=4',
    description: '本站博主，喜欢代码与胶片。',
    category: '博主',
    sortOrder: 1,
    visibility: 'public',
    createTime: '2026-06-28T12:00:00',
    updateTime: '2026-06-28T12:00:00'
  },
  {
    id: 2,
    title: 'Google',
    url: 'https://google.com',
    logo: 'https://www.google.com/favicon.ico',
    description: '谷歌搜索。',
    category: '推荐工具',
    sortOrder: 2,
    visibility: 'public',
    createTime: '2026-06-28T12:00:00',
    updateTime: '2026-06-28T12:00:00'
  }
]
