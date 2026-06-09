import { useCallback, useEffect, useRef, useState } from 'react'

import { useMutation } from '@tanstack/react-query'

import type {
  CaptchaType,
  GenerateClickResponse,
  GenerateRotateResponse,
  GenerateSlideResponse,
} from '@/schema/captcha/captcha'
import {
  generateClick,
  generateRotate,
  generateSlide,
  validateCaptcha,
} from '@/service/captcha/captcha'
import GoCaptcha from 'go-captcha-react'
import 'go-captcha-react/dist/go-captcha-react.cjs.development.css'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface CaptchaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  captchaType?: CaptchaType
  onSuccess: (token: string) => void
  onError?: (error: Error) => void
}

type CaptchaData = GenerateSlideResponse | GenerateClickResponse | GenerateRotateResponse

export function CaptchaDialog({
  open,
  onOpenChange,
  captchaType = 'slide',
  onSuccess,
  onError,
}: CaptchaDialogProps) {
  const { t } = useTranslation(['component', 'global'])
  const [captchaData, setCaptchaData] = useState<CaptchaData | null>(null)
  const captchaIdRef = useRef('')

  const generateMutation = useMutation<CaptchaData, Error>({
    mutationFn: () => {
      if (captchaType === 'click') return generateClick()
      if (captchaType === 'rotate') return generateRotate()
      return generateSlide()
    },
    onMutate: () => {
      setCaptchaData(null)
    },
    onSuccess: (data) => {
      captchaIdRef.current = data.captcha_id
      setCaptchaData(data)
    },
  })

  const generateRef = useRef(generateMutation.mutate)
  useEffect(() => {
    generateRef.current = generateMutation.mutate
  })

  const validateMutation = useMutation({
    mutationFn: validateCaptcha,
    onSuccess: (data) => {
      onSuccess(data.captcha_token)
      onOpenChange(false)
    },
    onError: (err) => {
      toast.error(t('captchaDialog.error'))
      onError?.(err instanceof Error ? err : new Error(String(err)))
    },
  })

  const validateRef = useRef(validateMutation.mutate)
  useEffect(() => {
    validateRef.current = validateMutation.mutate
  })

  useEffect(() => {
    if (open) {
      generateRef.current()
    }
  }, [open])

  const handleRefresh = useCallback(() => {
    generateRef.current()
  }, [])

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const handleSlideConfirm = useCallback((point: { x: number; y: number }, reset: () => void) => {
    validateRef.current(
      {
        captcha_type: 'slide',
        captcha_id: captchaIdRef.current,
        x: point.x,
        y: point.y,
      },
      { onError: () => reset() }
    )
  }, [])

  const handleClickConfirm = useCallback(
    (dots: Array<{ x: number; y: number }>, reset: () => void) => {
      validateRef.current(
        {
          captcha_type: 'click',
          captcha_id: captchaIdRef.current,
          dots: dots.map((d) => ({ x: d.x, y: d.y })),
        },
        { onError: () => reset() }
      )
    },
    []
  )

  const handleRotateConfirm = useCallback((angle: number, reset: () => void) => {
    validateRef.current(
      {
        captcha_type: 'rotate',
        captcha_id: captchaIdRef.current,
        angle,
      },
      { onError: () => reset() }
    )
  }, [])

  const renderCaptcha = () => {
    if (generateMutation.isPending || !captchaData) {
      return (
        <div className="flex h-48 w-full items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )
    }

    if (captchaType === 'slide') {
      const data = captchaData as GenerateSlideResponse
      return (
        <GoCaptcha.Slide
          data={{
            image: data.master_image,
            thumb: data.tile_image,
            thumbX: 0,
            thumbY: data.tile_y,
            thumbWidth: 0,
            thumbHeight: 0,
          }}
          events={{
            confirm: handleSlideConfirm,
            refresh: handleRefresh,
            close: handleClose,
          }}
        />
      )
    }

    if (captchaType === 'click') {
      const data = captchaData as GenerateClickResponse
      return (
        <GoCaptcha.Click
          data={{
            image: data.master_image,
            thumb: data.thumb_image,
          }}
          events={{
            confirm: handleClickConfirm,
            refresh: handleRefresh,
            close: handleClose,
          }}
        />
      )
    }

    const data = captchaData as GenerateRotateResponse
    return (
      <GoCaptcha.Rotate
        data={{
          image: data.master_image,
          thumb: data.thumb_image,
          angle: 0,
          thumbSize: 0,
        }}
        events={{
          confirm: handleRotateConfirm,
          refresh: handleRefresh,
          close: handleClose,
        }}
      />
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-fit" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('captchaDialog.title')}</DialogTitle>
        </DialogHeader>
        {renderCaptcha()}
      </DialogContent>
    </Dialog>
  )
}
