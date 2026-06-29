import request from './request'

/**
 * 获取当前存储介质基本信息
 */
export function getStorageType() {
  return request.get('/files/storage-type')
}

/**
 * 获取上传的文件列表
 */
export function getFileList() {
  return request.get('/files/list')
}

/**
 * 删除指定文件
 * @param fileName 文件名 / 云存储 Object Key
 */
export function deleteFile(fileName: string) {
  return request.delete('/files/delete', { params: { fileName } })
}
