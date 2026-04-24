import ky, { type Options } from 'ky'

const http = ky.create({
  prefix: import.meta.env.VITE_APP_DEFAULT_SERVER,
  retry: 0,
  hooks: {
    beforeRequest: [
      ({ request }) => {
        // e.g. request.headers.set('Authorization', `Bearer ${token}`)
        void request
      },
    ],
    afterResponse: [
      ({ response }) => {
        // e.g. handle 401 redirect
        void response
      },
    ],
    beforeError: [
      ({ error }) => {
        return error
      },
    ],
  },
})

export const get = <T>(url: string, options?: Options) => http.get(url, options).json<T>()

export const post = <T>(url: string, options?: Options) => http.post(url, options).json<T>()

export const put = <T>(url: string, options?: Options) => http.put(url, options).json<T>()

export const patch = <T>(url: string, options?: Options) => http.patch(url, options).json<T>()

export const del = <T>(url: string, options?: Options) => http.delete(url, options).json<T>()

export default http
