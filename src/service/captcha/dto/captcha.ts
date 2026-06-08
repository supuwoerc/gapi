export type CaptchaType = 'slide' | 'click' | 'rotate'

export interface GenerateSlideResponse {
  captcha_id: string
  master_image: string
  tile_image: string
  tile_y: number
}

export interface GenerateClickResponse {
  captcha_id: string
  master_image: string
  thumb_image: string
}

export interface GenerateRotateResponse {
  captcha_id: string
  master_image: string
  thumb_image: string
}

export interface ValidateCaptchaParams {
  captcha_type: CaptchaType
  captcha_id: string
  x?: number
  y?: number
  dots?: Array<{ x: number; y: number }>
  angle?: number
}

export interface ValidateCaptchaResponse {
  captcha_token: string
}
