export function formatBytesIEC(bytes) {
  if (bytes === 0) return '0 B'

  const isNegative = bytes < 0
  const absoluteBytes = Math.abs(bytes)

  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
  const index = Math.floor(Math.log2(absoluteBytes) / 10)
  const converted = absoluteBytes / Math.pow(2, index * 10)

  const formatted = `${converted.toFixed(2)} ${units[index]}`
  return isNegative ? `-${formatted}` : formatted
}
