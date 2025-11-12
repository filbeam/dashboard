export function formatBytesIEC(bytes) {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
  const index = Math.floor(Math.log2(Math.abs(bytes)) / 10)
  const converted = bytes / Math.pow(2, index * 10)

  return `${converted.toFixed(2)} ${units[index]}`
}
