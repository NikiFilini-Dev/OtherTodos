export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null
}

export const getRelativeLuminance = rgb =>
  0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]

export const getCssColor = rgb => `rgb(${rgb.map(c => c * 255)}`
