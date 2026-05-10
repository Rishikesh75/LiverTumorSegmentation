import type { HttpClient, HttpJsonResult } from '@infrastructure/http/types'

export function createHttpClient(baseUrl: string): HttpClient {
  const base = baseUrl.replace(/\/$/, '')

  return {
    async getJson<T>(path: string, init?: RequestInit): Promise<T> {
      const res = await fetch(`${base}${path}`, {
        ...init,
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...((init?.headers as Record<string, string>) ?? {}),
        },
        credentials: 'include',
      })
      if (!res.ok) {
        throw new Error(`GET ${path} failed: ${res.status}`)
      }
      return res.json() as Promise<T>
    },

    async getJsonAllowUnauthorized<T>(
      path: string,
      init?: RequestInit,
    ): Promise<T | null> {
      const res = await fetch(`${base}${path}`, {
        ...init,
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...((init?.headers as Record<string, string>) ?? {}),
        },
        credentials: 'include',
      })
      if (res.status === 401 || res.status === 403) {
        return null
      }
      if (!res.ok) {
        throw new Error(`GET ${path} failed: ${res.status}`)
      }
      return res.json() as Promise<T>
    },

    async postJson<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
      const res = await fetch(`${base}${path}`, {
        ...init,
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...((init?.headers as Record<string, string>) ?? {}),
        },
        body: JSON.stringify(body),
        credentials: 'include',
      })
      if (!res.ok) {
        throw new Error(`POST ${path} failed: ${res.status}`)
      }
      return res.json() as Promise<T>
    },

    async postJsonWithStatus<T>(
      path: string,
      body: unknown,
      init?: RequestInit,
    ): Promise<HttpJsonResult<T>> {
      const res = await fetch(`${base}${path}`, {
        ...init,
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...((init?.headers as Record<string, string>) ?? {}),
        },
        body: JSON.stringify(body),
        credentials: 'include',
      })
      const data = (await res.json()) as T
      return { ok: res.ok, status: res.status, data }
    },

    async postExpectNoContent(
      path: string,
      body?: unknown,
      init?: RequestInit,
    ): Promise<void> {
      const res = await fetch(`${base}${path}`, {
        ...init,
        method: 'POST',
        headers: {
          ...(body !== undefined
            ? {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                ...((init?.headers as Record<string, string>) ?? {}),
              }
            : {
                Accept: 'application/json',
                ...((init?.headers as Record<string, string>) ?? {}),
              }),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        credentials: 'include',
      })
      if (!res.ok) {
        throw new Error(`POST ${path} failed: ${res.status}`)
      }
    },

    async postFormData<T>(
      path: string,
      formData: FormData,
      init?: RequestInit,
    ): Promise<T> {
      const res = await fetch(`${base}${path}`, {
        ...init,
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
          ...((init?.headers as Record<string, string>) ?? {}),
        },
        credentials: 'include',
      })
      if (!res.ok) {
        throw new Error(`POST ${path} failed: ${res.status}`)
      }
      return res.json() as Promise<T>
    },

    async patchJson<T>(
      path: string,
      body: unknown,
      init?: RequestInit,
    ): Promise<T> {
      const res = await fetch(`${base}${path}`, {
        ...init,
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...((init?.headers as Record<string, string>) ?? {}),
        },
        body: JSON.stringify(body),
        credentials: 'include',
      })
      if (!res.ok) {
        throw new Error(`PATCH ${path} failed: ${res.status}`)
      }
      return res.json() as Promise<T>
    },
  }
}
