import request from './request'

export function getLoveList() {
  return request.get('/love/list')
}

export function createLove(payload: any) {
  return request.post('/love/create', payload)
}

export function updateLove(payload: any) {
  return request.put('/love/update', payload)
}

export function deleteLove(id: number | string) {
  return request.delete(`/love/delete/${id}`)
}

// Love Bucket
export function getLoveBucketList() {
  return request.get('/love/bucket/list')
}

export function createLoveBucket(payload: any) {
  return request.post('/love/bucket/create', payload)
}

export function updateLoveBucket(payload: any) {
  return request.put('/love/bucket/update', payload)
}

export function deleteLoveBucket(id: number | string) {
  return request.delete(`/love/bucket/delete/${id}`)
}

// Love Capsule
export function getLoveCapsuleList(params?: any) {
  return request.get('/love/capsule/list', { params })
}

export function createLoveCapsule(payload: any) {
  return request.post('/love/capsule/create', payload)
}

export function updateLoveCapsule(payload: any) {
  return request.put('/love/capsule/update', payload)
}

export function deleteLoveCapsule(id: number | string) {
  return request.delete(`/love/capsule/delete/${id}`)
}
