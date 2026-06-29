import request from './request'

export function getGalleryList(params?: any) {
  return request.get('/gallery/list', { params })
}

export function createGallery(payload: any) {
  return request.post('/gallery/create', payload)
}

export function updateGallery(payload: any) {
  return request.put('/gallery/update', payload)
}

export function deleteGallery(id: number | string) {
  return request.delete(`/gallery/delete/${id}`)
}

export function getFootprintCategoryList() {
  return request.get('/footprint-category/list')
}

export function createFootprintCategory(payload: any) {
  return request.post('/footprint-category/create', payload)
}

export function updateFootprintCategory(payload: any) {
  return request.put('/footprint-category/update', payload)
}

export function deleteFootprintCategory(id: number | string) {
  return request.delete(`/footprint-category/delete/${id}`)
}

