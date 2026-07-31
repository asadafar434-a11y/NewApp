import { describe, expect, it } from 'vitest'
import { app } from '../src/app.js'

describe('GET /api/v1/health', () => {
  it('возвращает 200 и статус ok', async () => {
    const res = await app.request('/api/v1/health')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'ok' })
  })
})

describe('несуществующий маршрут', () => {
  it('возвращает 404 в едином формате ошибки', async () => {
    const res = await app.request('/api/v1/nope')
    expect(res.status).toBe(404)

    const body = await res.json()
    expect(body).toEqual({
      error: { code: 'NOT_FOUND', message: 'Маршрут не найден' },
    })
  })
})
