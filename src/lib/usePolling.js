import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * Polls an async fetcher on an interval and exposes { data, error, loading, refetch }.
 * Pauses politely if the tab is hidden, resumes on focus.
 */
export function usePolling(fetcher, { intervalMs = 4000, deps = [] } = {}) {
  const [data, setData]       = useState(null)
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(true)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const run = useCallback(async () => {
    try {
      const result = await fetcherRef.current()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    let timer = null

    async function tick() {
      if (document.hidden) return
      await run()
    }

    ;(async () => {
      setLoading(true)
      await tick()
      if (!cancelled) timer = setInterval(tick, intervalMs)
    })()

    return () => {
      cancelled = true
      if (timer) clearInterval(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, error, loading, refetch: run }
}