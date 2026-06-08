import type {
  GenerateClickResponse,
  GenerateRotateResponse,
  GenerateSlideResponse,
  ValidateCaptchaParams,
  ValidateCaptchaResponse,
} from '@/schema/captcha/captcha'

import { get, post } from '@/lib/http'

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
