import { faker } from '@faker-js/faker'

const PLACEHOLDER_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

export function generateSlideData() {
  return {
    captcha_id: faker.string.uuid(),
    master_image: PLACEHOLDER_IMAGE,
    tile_image: PLACEHOLDER_IMAGE,
    tile_y: faker.number.int({ min: 20, max: 150 }),
  }
}

export function generateClickData() {
  return {
    captcha_id: faker.string.uuid(),
    master_image: PLACEHOLDER_IMAGE,
    thumb_image: PLACEHOLDER_IMAGE,
  }
}

export function generateRotateData() {
  return {
    captcha_id: faker.string.uuid(),
    master_image: PLACEHOLDER_IMAGE,
    thumb_image: PLACEHOLDER_IMAGE,
  }
}

export function generateCaptchaToken() {
  return {
    captcha_token: faker.string.alphanumeric(64),
  }
}
