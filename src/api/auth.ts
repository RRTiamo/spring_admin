import request from './request'

export function login(formData: URLSearchParams | any) {
  return request.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
}
