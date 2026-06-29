import request from './request'

export function getTimeLetterList(params?: any) {
  return request.get('/time-letter/list', { params })
}

export function createTimeLetter(payload: any) {
  return request.post('/time-letter/create', payload)
}

export function updateTimeLetter(payload: any) {
  return request.put('/time-letter/update', payload)
}

export function deleteTimeLetter(id: number | string) {
  return request.delete(`/time-letter/delete/${id}`)
}
