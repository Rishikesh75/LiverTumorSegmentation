export interface HttpClient {
  get<T>(path: string): Promise<T>
  getOptional<T>(path: string): Promise<T | null>
  post<T>(path: string, body?: unknown): Promise<T>
  postFormData<T>(path: string, formData: FormData): Promise<T>
}

export function createHttpClient(baseUrl: string): HttpClient {
  const resolveUrl = (path: string) => {
    if (path.startsWith('http')) return path
    const base = baseUrl.replace(/\/$/, '')
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return `${base}${normalizedPath}`
  }

  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const response = await fetch(resolveUrl(path), {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'include',
    })

    if (response.status === 204) {
      return undefined as T
    }

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(errorBody || `Request failed with status ${response.status}`)
    }

    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      return (await response.json()) as T
    }

    return undefined as T
  }

  return {
    get: <T>(path: string) => request<T>('GET', path),
    getOptional: async <T>(path: string): Promise<T | null> => {
      const response = await fetch(resolveUrl(path), {
        method: 'GET',
        credentials: 'include',
      })

      if (response.status === 401) return null
      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(errorBody || `Request failed with status ${response.status}`)
      }

      return (await response.json()) as T
    },
    post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
    postFormData: async <T>(path: string, formData: FormData): Promise<T> => {
      const response = await fetch(resolveUrl(path), {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(errorBody || `Request failed with status ${response.status}`)
      }

      return (await response.json()) as T
    },
  }
}
