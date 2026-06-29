export const iconOptions = [
  { label: '相机 (Camera)', value: 'Camera' },
  { label: '书本/日记 (BookOpen)', value: 'BookOpen' },
  { label: '定位针 (MapPin)', value: 'MapPin' },
  { label: '指南针 (Compass)', value: 'Compass' },
  { label: '心形 (Heart)', value: 'Heart' },
  { label: '汽车 (Car)', value: 'Car' },
  { label: '飞机 (Airplane)', value: 'Airplane' }
]

export const getIconClass = (iconName: string) => {
  const map: Record<string, string> = {
    'Camera': 'i-mdi-camera',
    'BookOpen': 'i-mdi-book-open',
    'MapPin': 'i-mdi-map-marker',
    'Compass': 'i-mdi-compass',
    'Heart': 'i-mdi-heart',
    'Car': 'i-mdi-car',
    'Airplane': 'i-mdi-airplane'
  }
  return map[iconName] || 'i-mdi-tag'
}
