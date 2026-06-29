import request from './request'

export function getFeedbackList(params: any) {
  return request.get('/admin/pond/feedback', { params })
}

export function approveFeedback(id: number | string) {
  return request.put(`/admin/pond/feedback/${id}/approve`, {})
}

export function rejectFeedback(id: number | string) {
  return request.put(`/admin/pond/feedback/${id}/reject`, {})
}

export function pendingFeedback(id: number | string) {
  return request.put(`/admin/pond/feedback/${id}/pending`, {})
}

export function completeFeedback(id: number | string) {
  return request.put(`/admin/pond/feedback/${id}/complete`, {})
}

export function pinFeedback(id: number | string) {
  return request.put(`/admin/pond/feedback/${id}/pin`, {})
}

export function featureFeedback(id: number | string) {
  return request.put(`/admin/pond/feedback/${id}/feature`, {})
}

export function deleteFeedback(id: number | string) {
  return request.delete(`/admin/pond/feedback/${id}`)
}

export function getFeedbackTags() {
  return request.get('/admin/pond/tags')
}

export function updateFeedbackTags(id: number | string, tags: any[]) {
  return request.post(`/admin/pond/feedback/${id}/tags`, tags)
}

export function updateTag(id: number | string, payload: any) {
  return request.put(`/admin/pond/tags/${id}`, payload)
}

export function createTag(payload: any) {
  return request.post('/admin/pond/tags', payload)
}

export function deleteTag(id: number | string) {
  return request.delete(`/admin/pond/tags/${id}`)
}

export function replyFeedback(id: number | string, payload: any) {
  return request.post(`/admin/pond/feedback/${id}/reply`, payload)
}

export function adoptFeedback(id: number | string, payload: any) {
  return request.put(`/admin/pond/feedback/${id}/adopt`, payload)
}

export function getFeedbackTypes() {
  return request.get('/pond/feedback-type/list')
}

export function createFeedbackType(payload: any) {
  return request.post('/pond/feedback-type/create', payload)
}

export function updateFeedbackType(payload: any) {
  return request.put('/pond/feedback-type/update', payload)
}

export function deleteFeedbackType(id: number | string) {
  return request.delete(`/pond/feedback-type/delete/${id}`)
}
