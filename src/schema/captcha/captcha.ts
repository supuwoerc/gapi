import { z } from 'zod'

export const captchaTypeSchema = z.enum(['slide', 'click', 'rotate'])

export type CaptchaType = z.infer<typeof captchaTypeSchema>

export const generateSlideResponseSchema = z.object({
  captcha_id: z.string(),
  master_image: z.string(),
  tile_image: z.string(),
  tile_y: z.number(),
})

export type GenerateSlideResponse = z.infer<typeof generateSlideResponseSchema>

export const generateClickResponseSchema = z.object({
  captcha_id: z.string(),
  master_image: z.string(),
  thumb_image: z.string(),
})

export type GenerateClickResponse = z.infer<typeof generateClickResponseSchema>

export const generateRotateResponseSchema = z.object({
  captcha_id: z.string(),
  master_image: z.string(),
  thumb_image: z.string(),
})

export type GenerateRotateResponse = z.infer<typeof generateRotateResponseSchema>

export const validateCaptchaResponseSchema = z.object({
  captcha_token: z.string(),
})

export type ValidateCaptchaResponse = z.infer<typeof validateCaptchaResponseSchema>
