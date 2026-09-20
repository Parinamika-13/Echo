import { useEffect, useRef, useState } from 'react'
import { formatNumber } from '@/lib/format'
import { useReducedMotion } from '@/hooks/useMediaQuery'

export function AnimatedCounter({
  value,
  digits = 0,
}: {
  value: number | null | undefined
  digits?: number
}) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(value ?? 0)
  const fromRef = useRef(0)

  useEffect(() => {
    if (value == null) return
    if (reduce) {
      setShown(value)
      return
    }
    const from = fromRef.current
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 700)
      const eased = 1 - (1 - t) ** 3
      setShown(from + (value - from) * eased)
      if (t < 1) frame = requestAnimationFrame(tick)
      else fromRef.current = value
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [reduce, value])

  if (value == null) return <span>—</span>
  return <span className="tabular">{formatNumber(shown, digits)}</span>
}
