import { delay, http } from 'msw'

import {
  generateCaptchaToken,
  generateClickData,
  generateRotateData,
  generateSlideData,
} from '../data/captcha'
import { jsonEnvelope } from '../utils/response'

const BASE = import.meta.env.VITE_APP_DEFAULT_SERVER

export const captchaHandlers = [
  http.get(`${BASE}/captcha/slide`, async () => {
    await delay(500)
    return jsonEnvelope(generateSlideData())
  }),

  http.get(`${BASE}/captcha/click`, async () => {
    await delay(500)
    return jsonEnvelope(generateClickData())
  }),

  http.get(`${BASE}/captcha/rotate`, async () => {
    await delay(500)
    return jsonEnvelope(generateRotateData())
  }),

  http.post(`${BASE}/captcha/validate`, async () => {
    await delay(800)
    return jsonEnvelope(generateCaptchaToken())
  }),
]
