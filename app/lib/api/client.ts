import { tokenStore } from "./store"
import type {
  LoginResponse,
  ProblemDetails,
  RefreshTokenRequest,
} from "./types"

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5272/api/v1"

let isRefreshing = false
let refreshQueue: Array<{
  resolve: (token: string | null) => void
  reject: (error: unknown) => void
}> = []

function enqueueRefresh(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    refreshQueue.push({ resolve, reject })
  })
}

function dequeueRefresh(token: string | null, error: unknown | null) {
  for (const entry of refreshQueue) {
    if (error) {
      entry.reject(error)
    } else {
      entry.resolve(token)
    }
  }
  refreshQueue = []
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStore.getRefreshToken()
  if (!refreshToken) return null

  const body: RefreshTokenRequest = { refreshToken }

  try {
    const response = await fetch(`${BASE_URL}/Auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      tokenStore.clear()
      return null
    }

    const data = (await response.json()) as LoginResponse
    if (data.accessToken) tokenStore.setAccessToken(data.accessToken)
    if (data.refreshToken) tokenStore.setRefreshToken(data.refreshToken)

    return data.accessToken ?? null
  } catch {
    tokenStore.clear()
    return null
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  headers?: Record<string, string>
}

export class ApiError extends Error {
  status: number
  problem?: ProblemDetails

  constructor(status: number, problem?: ProblemDetails) {
    const message = problem?.detail ?? problem?.title ?? "Request failed"
    super(message)
    this.name = "ApiError"
    this.status = status
    this.problem = problem
  }
}

/**
 * Normaliza um erro capturado em mensagem exibível.
 * Extrai `message` quando o erro é um `ApiError`; caso contrário, retorna o
 * `fallback` (que deve ser uma mensagem em pt-BR amigável ao usuário).
 */
export function getErrorMessage(
  err: unknown,
  fallback = "Ocorreu um erro inesperado. Tente novamente."
): string {
  return err instanceof ApiError ? err.message : fallback
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options

  const accessToken = tokenStore.getAccessToken()

  const requestHeaders: Record<string, string> = { ...headers }
  if (accessToken && !requestHeaders.Authorization) {
    requestHeaders.Authorization = `Bearer ${accessToken}`
  }

  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders["Content-Type"] = "application/json"
  }

  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
    body:
      body instanceof FormData
        ? body
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
  }

  let response = await fetch(`${BASE_URL}${path}`, fetchOptions)

  if (response.status === 401 && accessToken) {
    if (!isRefreshing) {
      isRefreshing = true
      try {
        const newToken = await refreshAccessToken()
        dequeueRefresh(newToken, null)
        isRefreshing = false

        if (newToken) {
          requestHeaders.Authorization = `Bearer ${newToken}`
          response = await fetch(`${BASE_URL}${path}`, {
            ...fetchOptions,
            headers: requestHeaders,
          })
        }
      } catch (error) {
        dequeueRefresh(null, error)
        isRefreshing = false
        tokenStore.clear()
      }
    } else {
      try {
        const newToken = await enqueueRefresh()
        if (newToken) {
          requestHeaders.Authorization = `Bearer ${newToken}`
          response = await fetch(`${BASE_URL}${path}`, {
            ...fetchOptions,
            headers: requestHeaders,
          })
        }
      } catch {
        tokenStore.clear()
      }
    }
  }

  if (!response.ok) {
    let problem: ProblemDetails | undefined
    try {
      problem = (await response.json()) as ProblemDetails
    } catch {
      // response has no body
    }
    throw new ApiError(response.status, problem)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as T
}

export const api = {
  get<T>(path: string): Promise<T> {
    return request<T>(path)
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, { method: "POST", body })
  },

  put<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, { method: "PUT", body })
  },

  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: "DELETE" })
  },

  upload<T>(path: string, formData: FormData): Promise<T> {
    return request<T>(path, { method: "POST", body: formData })
  },
}
