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

export const validateCaptchaParamsSchema = z.object({
  captcha_type: captchaTypeSchema,
  captcha_id: z.string(),
  x: z.number().optional(),
  y: z.number().optional(),
  dots: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
  angle: z.number().optional(),
})

export type ValidateCaptchaParams = z.infer<typeof validateCaptchaParamsSchema>

export const validateCaptchaResponseSchema = z.object({
  captcha_token: z.string(),
})

export type ValidateCaptchaResponse = z.infer<typeof validateCaptchaResponseSchema>
