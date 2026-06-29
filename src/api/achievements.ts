import request from './request'

// Achievements
export function getAchievementsList() {
  return request.get('/achievements/list')
}

export function createAchievement(payload: any) {
  return request.post('/achievements/create', payload)
}

export function updateAchievement(payload: any) {
  return request.put('/achievements/update', payload)
}

export function deleteAchievement(id: number | string) {
  return request.delete(`/achievements/delete/${id}`)
}

// Achievement Metas
export function getAchievementMetasList() {
  return request.get('/achievement-metas/list')
}

export function createAchievementMeta(payload: any) {
  return request.post('/achievement-metas/create', payload)
}

export function updateAchievementMeta(payload: any) {
  return request.put('/achievement-metas/update', payload)
}

export function deleteAchievementMeta(id: number | string) {
  return request.delete(`/achievement-metas/delete/${id}`)
}
