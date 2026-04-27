/**
 * 业务请求错误，携带后端返回的业务状态码
 * Business request error carrying the backend business status code
 */
export class BizRequestError extends Error {
  code: number

  constructor(code: number, message: string) {
    super(message)
    this.name = 'BizRequestError'
    this.code = code
  }
}
