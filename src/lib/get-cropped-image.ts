import type { CropperAreaData } from '@/components/ui/cropper'

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

export async function getCroppedImage(
  imageSrc: string,
  croppedAreaPixels: CropperAreaData,
  maxSize?: number
): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  let outputWidth = croppedAreaPixels.width
  let outputHeight = croppedAreaPixels.height

  if (maxSize && (outputWidth > maxSize || outputHeight > maxSize)) {
    const scale = maxSize / Math.max(outputWidth, outputHeight)
    outputWidth = Math.round(outputWidth * scale)
    outputHeight = Math.round(outputHeight * scale)
  }

  canvas.width = outputWidth
  canvas.height = outputHeight

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    outputWidth,
    outputHeight
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      'image/jpeg',
      0.9
    )
  })
}
