import { useCallback, useEffect, useRef, useState } from "react"
import { ApiError } from "~/lib/api/client"

/**
 * Resultado opcional do mapeamento de erro no hook `useAsyncData`.
 * `message` é a mensagem exibida; `notFound` marca o estado 404 (opcional).
 */
export interface AsyncErrorInfo {
  message: string
  notFound?: boolean
}

export interface UseAsyncDataOptions {
  /**
   * Mapeia um erro para uma mensagem/estado customizados (ex.: triagem por
   * status HTTP). Retorne `null` para cair no tratamento padrão
   * (ApiError.message ou `fallbackError`).
   */
  mapError?: (err: unknown) => AsyncErrorInfo | null
  /** Mensagem usada quando o erro não é um ApiError e não há mapError. */
  fallbackError?: string
  /** Reseta `data` para null no início de cada fetch (útil ao trocar de chave). */
  resetOnFetch?: boolean
}

/**
 * Hook padrão do projeto para carregamento de dados assíncronos em efeito.
 * Consolida o padrão `.then/.catch/.finally` com flag de cancelamento
 * (evita setState após unmount) e `refresh()` para re-disparo.
 *
 * - `fetcher`: função que retorna a Promise; a última referência é usada
 *   (guardada em ref) para o efeito não re-disparar por identidade.
 * - `deps`: dependências que devem re-executar o fetch além do `refresh()`.
 *
 * Retorna `data`, `setData` (para atualizações manuais/otimistas), `loading`,
 * `error`, `notFound` e `refresh`.
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[] = [],
  options: UseAsyncDataOptions = {}
) {
  const {
    mapError,
    fallbackError = "Erro ao carregar dados.",
    resetOnFetch = false,
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [trigger, setTrigger] = useState(0)

  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const refresh = useCallback(() => setTrigger((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setNotFound(false)
    if (resetOnFetch) setData(null)

    fetcherRef.current()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err: unknown) => {
        if (cancelled) return

        if (mapError) {
          const info = mapError(err)
          if (info) {
            setError(info.message)
            if (info.notFound) setNotFound(true)
            return
          }
        }

        setError(err instanceof ApiError ? err.message : fallbackError)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // O fetcher é mantido em ref; as dependências reais são passadas via
    // `deps` (e `trigger`), não pela identidade da função.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, ...deps])

  return { data, setData, loading, error, notFound, refresh }
}
