import request from './request'

export function getBlogsList() {
  return request.get('/blogs/list')
}

export function createBlog(payload: any) {
  return request.post('/blogs/create', payload)
}

export function updateBlog(payload: any) {
  return request.put('/blogs/update', payload)
}

export function deleteBlog(id: number | string) {
  return request.delete(`/blogs/delete/${id}`)
}

export function generateSummary(payload: { content: string }) {
  return request.post('/blogs/generate-summary', payload)
}
