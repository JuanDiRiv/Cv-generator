// src/lib/image.ts
const MAX_INPUT_BYTES = 10 * 1024 * 1024
const OUTPUT_SIZE = 300
const JPEG_QUALITY = 0.85

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('No se pudo leer la imagen'))
    img.src = src
  })
}

/**
 * Center-crops an image file to a square and returns it as a small JPEG data URL,
 * suitable for storing inline in the Firestore CV document.
 */
export async function fileToProfilePhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('El archivo no es una imagen')
  if (file.size > MAX_INPUT_BYTES) throw new Error('La imagen supera los 10 MB')

  const url = URL.createObjectURL(file)
  try {
    const img = await loadImage(url)
    const side = Math.min(img.naturalWidth, img.naturalHeight)
    const sx = (img.naturalWidth - side) / 2
    const sy = (img.naturalHeight - side) / 2

    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('No se pudo procesar la imagen')

    // JPEG has no alpha: paint white so transparent PNGs don't turn black
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
    ctx.drawImage(img, sx, sy, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)

    return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
  } finally {
    URL.revokeObjectURL(url)
  }
}
