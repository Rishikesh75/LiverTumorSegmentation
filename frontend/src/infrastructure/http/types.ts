export type HttpJsonResult<T> = {
  ok: boolean
  status: number
  data: T
}

export type HttpClient = {
  getJson<T>(path: string, init?: RequestInit): Promise<T>
  /** Returns null when the server responds with 401 or 403. */
  getJsonAllowUnauthorized<T>(
    path: string,
    init?: RequestInit,
  ): Promise<T | null>
  postJson<T>(path: string, body: unknown, init?: RequestInit): Promise<T>
  /** POST JSON and always parse body; use when the API returns JSON on error (e.g. 400). */
  postJsonWithStatus<T>(
    path: string,
    body: unknown,
    init?: RequestInit,
  ): Promise<HttpJsonResult<T>>
  /** POST with optional JSON body; accepts 204 or empty body (no JSON). */
  postExpectNoContent(
    path: string,
    body?: unknown,
    init?: RequestInit,
  ): Promise<void>
  postFormData<T>(path: string, formData: FormData, init?: RequestInit): Promise<T>
  patchJson<T>(path: string, body: unknown, init?: RequestInit): Promise<T>
}
