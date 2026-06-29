import request from './request'

export function getPublicConfig() {
  return request.get('/config/public')
}

export function getConfigList() {
  return request.get('/config/list')
}

export function updateConfigBatch(payload: any) {
  return request.post('/config/update-batch', payload)
}
