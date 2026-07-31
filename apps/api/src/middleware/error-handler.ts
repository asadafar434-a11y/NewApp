import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { HTTPException } from 'hono/http-exception'
import { ERROR_CODES, type ErrorCode } from '@orbital/shared'
import { logger } from '../lib/logger.js'

export class ApiError extends HTTPException {
  constructor(
    status: ContentfulStatusCode,
    public code: ErrorCode,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(status, { message })
  }
}

export function errorHandler(err: Error, c: Context) {
  if (err instanceof ApiError) {
    return c.json(
      { error: { code: err.code, message: err.message, details: err.details } },
      err.status,
    )
  }

  logger.error({ err }, 'необработанная ошибка')
  return c.json(
    { error: { code: ERROR_CODES.INTERNAL, message: 'Внутренняя ошибка сервера' } },
    500,
  )
}

export function notFoundHandler(c: Context) {
  return c.json(
    { error: { code: ERROR_CODES.NOT_FOUND, message: 'Маршрут не найден' } },
    404,
  )
}
