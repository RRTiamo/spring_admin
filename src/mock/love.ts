import type { LoveEntry, FootprintCategory } from '../interface/love'

export const mockLoveNotes: LoveEntry[] = [
  {
    id: 1,
    slug: 'anniversary-3years',
    title: '三周年：从日落到星空',
    date: '2026-05-20T18:00:00',
    location: '阿那亚 · 黄金海岸',
    mood: 'romantic',
    visibility: 'public',
    cover: '/assets/love-anniversary.png',
    content: '海浪冲刷着沙滩，我们在阿那亚的孤独图书馆旁坐了很久。从天色微红一直坐到繁星点点，风很大，但因为你靠在身旁，一切都显得无比安详。谢谢你陪我走过的第三个四季。'
  },
  {
    id: 2,
    slug: 'first-cooking-disaster',
    title: '厨房里的“灾难”与大笑',
    date: '2026-02-14T19:30:00',
    location: '我们的出租屋',
    mood: 'playful',
    visibility: 'private',
    cover: '/assets/love-cooking.png',
    content: '本来计划做一顿法式红酒炖牛肉，结果因为聊天太投入，红酒收汁过头，牛肉有些焦糊，烟雾报警器还响了起来。我们手忙脚乱地挥动抹布散热，最后只能叫了外卖披萨。但那晚我们开了一瓶好酒，坐在地板上笑了整整一个通宵。'
  }
]

export const mockFootprintCategories: FootprintCategory[] = [
  { id: 1, name: '光影影像', code: 'photo', icon: 'Camera' },
  { id: 2, name: '甜蜜瞬间', code: 'love', icon: 'BookOpen' }
]
