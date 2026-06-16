import { useCallback, useEffect, useRef, useState } from 'react'

import { Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import type { CropperAreaData, CropperPoint, CropperShape } from '@/components/ui/cropper'
import { Cropper, CropperArea, CropperImage } from '@/components/ui/cropper'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

async function getCroppedImage(
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

const DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const DEFAULT_MAX_FILE_SIZE_MB = 2

interface ImageCropDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCropComplete: (blob: Blob) => void
  title?: string
  initialImage?: string
  aspectRatio?: number
  shape?: CropperShape
  maxOutputSize?: number
  accept?: string[]
  maxFileSizeMB?: number
}

export function ImageCropDialog({
  open,
  onOpenChange,
  onCropComplete,
  title,
  initialImage,
  aspectRatio = 1,
  shape = 'rectangle',
  maxOutputSize,
  accept = DEFAULT_ACCEPTED_TYPES,
  maxFileSizeMB = DEFAULT_MAX_FILE_SIZE_MB,
}: ImageCropDialogProps) {
  const { t } = useTranslation(['component', 'global'])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(initialImage ?? null)
  const imageSrcRef = useRef<string | null>(null)
  const [crop, setCrop] = useState<CropperPoint>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropperAreaData | null>(null)
  const [confirming, setConfirming] = useState(false)
  const wasOpenRef = useRef(open)

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      if (imageSrcRef.current) {
        URL.revokeObjectURL(imageSrcRef.current)
        imageSrcRef.current = null
      }
      setImageSrc(initialImage ?? null)
    }
    wasOpenRef.current = open
  }, [initialImage, open])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen)
      if (!nextOpen) {
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setCroppedAreaPixels(null)
        setConfirming(false)
      }
    },
    [onOpenChange]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (!accept.includes(file.type)) {
        toast.error(t('imageCropDialog.invalidFileType'))
        return
      }
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        toast.error(t('imageCropDialog.fileTooLarge', { maxSize: maxFileSizeMB }))
        return
      }

      if (imageSrcRef.current) {
        URL.revokeObjectURL(imageSrcRef.current)
      }
      const url = URL.createObjectURL(file)
      imageSrcRef.current = url
      setImageSrc(url)
      setCrop({ x: 0, y: 0 })
      setZoom(1)

      e.target.value = ''
    },
    [accept, maxFileSizeMB, t]
  )

  const handleCropAreaChange = useCallback(
    (_croppedArea: CropperAreaData, croppedAreaPixels: CropperAreaData) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const handleConfirm = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return
    setConfirming(true)
    try {
      const blob = await getCroppedImage(imageSrc, croppedAreaPixels, maxOutputSize)
      if (imageSrcRef.current) {
        URL.revokeObjectURL(imageSrcRef.current)
      }
      const croppedUrl = URL.createObjectURL(blob)
      imageSrcRef.current = croppedUrl
      setImageSrc(croppedUrl)
      onCropComplete(blob)
      handleOpenChange(false)
    } catch {
      toast.error(t('global:error'))
    } finally {
      setConfirming(false)
    }
  }, [imageSrc, croppedAreaPixels, maxOutputSize, onCropComplete, handleOpenChange, t])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{title ?? t('imageCropDialog.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {imageSrc ? (
            <>
              <Cropper
                className="relative h-64 w-full overflow-hidden rounded-md"
                crop={crop}
                zoom={zoom}
                aspectRatio={aspectRatio}
                shape={shape}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropAreaChange={handleCropAreaChange}
              >
                <CropperImage src={imageSrc} alt="crop preview" />
                <CropperArea />
              </Cropper>
              <div className="flex items-center gap-3 px-1">
                <span className="text-sm text-muted-foreground">-</span>
                <Slider
                  value={[zoom]}
                  min={1}
                  max={3}
                  step={0.01}
                  onValueChange={([v]) => setZoom(v)}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">+</span>
              </div>
            </>
          ) : (
            <div
              className="flex h-64 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-muted-foreground/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-8" />
              <span className="text-sm">{t('imageCropDialog.selectFile')}</span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={accept.join(',')}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <DialogFooter className="gap-2">
          {imageSrc && (
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              {t('imageCropDialog.selectFile')}
            </Button>
          )}
          <Button type="button" disabled={!croppedAreaPixels || confirming} onClick={handleConfirm}>
            {t('global:button.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
