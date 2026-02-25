import { useEffect, useRef, useState } from 'react'

import Autoplay from 'embla-carousel-autoplay'
import type { HighlighterCore } from 'shiki'
import { createHighlighter } from 'shiki'
import 'shiki-magic-move/dist/style.css'
import { ShikiMagicMove } from 'shiki-magic-move/react'

import write from '@/assets/auth/write.png'

import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'

import AuthForm from './components/auth-form'
import { codeSnippets, langs } from './data/constant'

const Login: React.FC = () => {
  const [code, setCode] = useState(codeSnippets[0])
  const [lang, setLang] = useState(langs[0])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [highlighter, setHighlighter] = useState<HighlighterCore>()
  const plugin = useRef(Autoplay({ delay: 30000, stopOnInteraction: true }))
  const timer = useRef<ReturnType<typeof setInterval>>(null)

  useEffect(() => {
    let ins: HighlighterCore
    async function initializeHighlighter() {
      ins = await createHighlighter({
        themes: ['vitesse-dark'],
        langs: langs,
      })
      setHighlighter(ins)
    }
    initializeHighlighter()
    return () => {
      ins?.dispose()
    }
  }, [])

  useEffect(() => {
    timer.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1
        if (next > codeSnippets.length - 1) {
          return 0
        }
        return next
      })
    }, 3000)
    return () => {
      if (timer.current) {
        clearInterval(timer.current)
      }
    }
  }, [])

  useEffect(() => {
    setCode(codeSnippets[currentIndex])
    setLang(langs[currentIndex])
  }, [currentIndex])

  return (
    <div className="relative grid h-svh lg:grid-cols-[11fr_14fr]">
      <div className="h-full w-full overflow-hidden text-ellipsis whitespace-nowrap max-lg:hidden">
        {highlighter && (
          <Carousel
            className="h-full w-full cursor-pointer"
            plugins={plugin.current ? [plugin.current] : []}
            opts={{ loop: true }}
            onMouseEnter={() => plugin.current?.stop()}
            onMouseLeave={() => plugin.current?.play()}
          >
            <CarouselContent>
              <CarouselItem className="h-svh bg-[linear-gradient(163.85deg,#1d2129,#00308f)]">
                <div className="flex h-full items-center justify-center">
                  <div>
                    <h2 className="mb-3 indent-2 text-xl text-[#f3a709]">自动转换数据定义</h2>
                    <ShikiMagicMove
                      lang={lang}
                      theme={'vitesse-dark'}
                      highlighter={highlighter}
                      code={code}
                      options={{
                        duration: 800,
                        stagger: 0.3,
                        lineNumbers: true,
                      }}
                      className="bg-transparent!"
                    />
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem className="h-svh bg-[linear-gradient(163.85deg,#1d2129,#00308f)]">
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <h2 className="text-[20px] font-semibold text-[#f3a709]">
                      完善的文档管理，集成多种API工具
                    </h2>
                    <h4 className="text-base text-[#f3a709] opacity-80">Postman、HAR、Swagger</h4>
                    <img className="w-66 lg:w-72" src={write} />
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        )}
      </div>
      <div className="flex h-full w-full items-center justify-center lg:p-8">
        <div>
          <div className="mb-2 flex flex-col gap-y-2 text-start sm:px-8">
            <h2 className="text-lg font-semibold tracking-tight">Login</h2>
            <p className="text-sm text-muted-foreground">
              Enter your email and password below to log into your account
            </p>
          </div>
          <AuthForm className="mx-auto my-auto space-y-2 sm:w-120 sm:px-8" />
        </div>
      </div>
    </div>
  )
}
export default Login
