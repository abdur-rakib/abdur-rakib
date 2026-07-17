import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('POST /api/revalidate', () => {
  it('returns 401 when the secret header is missing', async () => {
    vi.stubEnv('REVALIDATE_SECRET', 'correct-secret')
    const { POST } = await import('./route')

    const res = await POST(new Request('http://localhost/api/revalidate', { method: 'POST' }))

    expect(res.status).toBe(401)
  })

  it('returns 401 when the secret header is wrong', async () => {
    vi.stubEnv('REVALIDATE_SECRET', 'correct-secret')
    const { POST } = await import('./route')

    const res = await POST(
      new Request('http://localhost/api/revalidate', {
        method: 'POST',
        headers: { 'x-revalidate-secret': 'wrong-secret' },
      })
    )

    expect(res.status).toBe(401)
  })

  it('revalidates /blog and returns 200 when the secret matches', async () => {
    vi.stubEnv('REVALIDATE_SECRET', 'correct-secret')
    const { revalidatePath } = await import('next/cache')
    const { POST } = await import('./route')

    const res = await POST(
      new Request('http://localhost/api/revalidate', {
        method: 'POST',
        headers: { 'x-revalidate-secret': 'correct-secret' },
      })
    )

    expect(res.status).toBe(200)
    expect(revalidatePath).toHaveBeenCalledWith('/blog')
  })
})
