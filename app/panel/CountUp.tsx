'use client'
import { useEffect, useRef, useState } from 'react'

export default function CountUp({ value, decimals = 0, className }: { value: number; decimals?: number; className?: string }) {
  const [n, setN] = useState(0)
  const done = useRef(false)
  useEffect(() => {
    if (done.current) return; done.current = true
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(value); return }
    const dur = 900, start = performance.now()
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setN(value * e)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])
  return <span className={className}>{decimals ? n.toFixed(decimals) : Math.round(n)}</span>
}
