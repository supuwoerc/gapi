import type {
  CaptchaType,
  GenerateClickResponse,
  GenerateRotateResponse,
  GenerateSlideResponse,
  ValidateCaptchaResponse,
} from '@/schema/captcha/captcha'

import { get, post } from '@/lib/http'

interface ValidateCaptchaParams {
  captcha_type: CaptchaType
  captcha_id: string
  x?: number
  y?: number
  dots?: { x: number; y: number }[]
  angle?: number
}

export function generateSlide() {
  return get<GenerateSlideResponse>('/captcha/slide')
}

export function generateClick() {
  return get<GenerateClickResponse>('/captcha/click')
}

export function generateRotate() {
  return get<GenerateRotateResponse>('/captcha/rotate')
}

export function validateCaptcha(params: ValidateCaptchaParams) {
  return post<ValidateCaptchaResponse>('/captcha/validate', { json: params })
}
