import request from './request'

export function getCategoriesList() {
  return request.get('/categories/list')
}

export function createCategory(payload: any) {
  return request.post('/categories/create', payload)
}

export function updateCategory(payload: any) {
  return request.put('/categories/update', payload)
}

export function deleteCategory(id: number | string) {
  return request.delete(`/categories/delete/${id}`)
}
