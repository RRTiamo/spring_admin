import request from './request'

export function getLinksList() {
  return request.get('/links/list')
}

export function createLink(payload: any) {
  return request.post('/links/create', payload)
}

export function updateLink(payload: any) {
  return request.post('/links/update', payload)
}

export function deleteLink(id: number | string) {
  return request.delete(`/links/delete/${id}`)
}
