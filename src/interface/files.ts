export interface StorageInfo {
  type: string
  bucketName?: string
  domain?: string
  endpoint?: string
  localPath?: string
}

export interface FileItem {
  fileName: string
  url: string
  size: number
  updateTime: number // 毫秒时间戳
  storageType: string
}
