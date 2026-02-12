import { type CSSProperties, type FC, useRef } from 'react'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useLocation, useNavigate } from 'react-router'

import Favicon from '@/assets/logo.svg?react'

import { cn } from '@/lib/utils'

import { appEnv } from '@/utils/env'

interface LogoProps {
  style?: CSSProperties
  pure?: boolean
  to?: string
  className?: string
}

const Logo: FC<LogoProps> = ({ pure = false, to, style, className }) => {
  const logoRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const onClickHandle = () => {
    if (to) {
      navigate(to)
    }
  }
  useGSAP(
    () => {
      const paths = logoRef.current?.querySelectorAll<SVGPathElement>('.animation-path')
      if (paths && paths.length) {
        paths.forEach((item) => {
          const strokeLength = item.getTotalLength()
          const timeline = gsap.timeline({})
          timeline
            .set(item, {
              strokeDasharray: strokeLength,
              strokeDashoffset: strokeLength / 4,
              fill: 'none',
            })
            .to(item, {
              strokeDashoffset: 0,
              duration: 0.6,
              ease: 'power2.inOut',
              fill: 'var(--primary)',
            })
        })
      }
    },
    { dependencies: [location.pathname], revertOnUpdate: true }
  )
  useGSAP(
    () => {
      const logoSvg = logoRef.current?.querySelector<SVGPathElement>('.icon')
      if (logoSvg) {
        gsap.from(logoSvg, {
          xPercent: -200,
          opacity: 0,
          duration: 0.6,
          rotate: -360,
        })
      }
    },
    { dependencies: [], scope: logoRef }
  )

  return (
    <div
      ref={logoRef}
      className={cn(
        'z-99 flex h-15 items-center justify-center gap-0.5 overflow-y-hidden px-2',
        to ? 'cursor-pointer' : '',
        className
      )}
      style={style}
      onClick={onClickHandle}
    >
      <Favicon width={30} stroke="var(--primary)" strokeWidth={16} />
      {pure ? null : <span style={{ marginLeft: 10 }}>{appEnv.VITE_APP_NAME}</span>}
    </div>
  )
}

export { Logo }
