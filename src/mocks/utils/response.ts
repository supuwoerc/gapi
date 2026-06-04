import { HttpResponse } from 'msw'

export function jsonEnvelope<T>(data: T) {
  return HttpResponse.json({ code: 100000, data, message: 'success' })
}

export function errorEnvelope(code: number, message: string) {
  return HttpResponse.json({ code, data: null, message })
}
