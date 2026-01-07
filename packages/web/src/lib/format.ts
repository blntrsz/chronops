export function formatDateTime(value: unknown) {
  const date = value instanceof Date ? value : new Date(String(value))
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString()
}
