import { useEffect, useRef, useState } from 'react'

import { useGSAP } from '@gsap/react'
import Autoplay from 'embla-carousel-autoplay'
import gsap from 'gsap'
import { SplitText } from 'gsap/all'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import type { HighlighterCore } from 'shiki'
import { createHighlighter } from 'shiki'
import 'shiki-magic-move/dist/style.css'
import { ShikiMagicMove } from 'shiki-magic-move/react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Spinner } from '@/components/ui/spinner'

import AuthForm from './components/auth-form'
import { carouselItems, codeSnippets, langs } from './data/constant'

const Login: React.FC = () => {
  const [currentCodeIndex, setCodeCurrentIndex] = useState(0)
  const [highlighter, setHighlighter] = useState<HighlighterCore>()
  const [plugin] = useState(() => Autoplay({ delay: 30000, stopOnInteraction: true }))
  const timer = useRef<ReturnType<typeof setInterval>>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const splitRef = useRef<{ title?: SplitText; sub?: SplitText }>({})

  const { t, i18n } = useTranslation('feature')

  useEffect(() => {
    let ins: HighlighterCore
    async function initializeHighlighter() {
      ins = await createHighlighter({
        themes: ['github-dark-high-contrast'],
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
    if (!carouselApi) return
    const updateCarouselState = () => {
      setCurrentIndex(carouselApi.selectedScrollSnap())
    }
    updateCarouselState()
    carouselApi.on('select', updateCarouselState)
    return () => {
      carouselApi.off('select', updateCarouselState)
    }
  }, [carouselApi])

  useEffect(() => {
    timer.current = setInterval(() => {
      setCodeCurrentIndex((prev) => {
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

  const code = codeSnippets[currentCodeIndex]
  const lang = langs[currentCodeIndex]

  useGSAP(
    () => {
      if (!carouselApi) return

      const cleanupPreviousAnimations = () => {
        timelineRef.current?.kill()
        splitRef.current.title?.revert()
        splitRef.current.title?.kill()
        splitRef.current.sub?.revert()
        splitRef.current.sub?.kill()
        splitRef.current = {}
      }

      cleanupPreviousAnimations()

      const scopeSelector = `.item[data-index='${currentIndex}']`
      const titleSelector = `${scopeSelector} .title`
      const subTitleSelector = `${scopeSelector} .subtitle`
      const coverSelector = `${scopeSelector} .cover`

      const titleSplit = SplitText.create(titleSelector, { type: 'chars' })
      const subTitleSplit = SplitText.create(subTitleSelector, { type: 'chars' })
      splitRef.current = { title: titleSplit, sub: subTitleSplit }

      const tl = gsap.timeline({
        delay: 0.2,
      })
      tl.from(coverSelector, {
        duration: 0.6,
        yPercent: 8,
        ease: 'back.out(1.7)',
      })
        .from(
          titleSplit.chars,
          {
            opacity: 0,
            yPercent: 20,
            display: 'inline-block',
            duration: 1,
            stagger: 0.02,
            ease: 'expo.out',
          },
          '<+=0.2'
        )
        .from(
          subTitleSplit.chars,
          {
            opacity: 0,
            display: 'inline-block',
            duration: 0.5,
            stagger: 0.03,
            ease: 'power1.inOut',
          },
          '<'
        )

      timelineRef.current = tl

      return () => cleanupPreviousAnimations()
    },
    {
      dependencies: [currentIndex, carouselApi, i18n.language],
      scope: carouselRef,
      revertOnUpdate: false,
    }
  )
  useEffect(() => {
    return () => {
      timelineRef.current?.kill()
      splitRef.current.title?.revert()
      splitRef.current.title?.kill()
      splitRef.current.sub?.revert()
      splitRef.current.sub?.kill()
    }
  }, [])

  const location = useLocation()

  const searchParams = new URLSearchParams(location.search)
  const redirect = searchParams.get('redirect')

  return (
    <div className="relative grid h-svh lg:grid-cols-[11fr_14fr]">
      <div className="h-full w-full truncate max-lg:hidden">
        {
          <Carousel
            ref={carouselRef}
            className="h-full w-full cursor-pointer"
            plugins={plugin ? [plugin] : []}
            opts={{ loop: true }}
            onMouseEnter={() => plugin?.stop()}
            onMouseLeave={() => plugin?.play()}
            setApi={setCarouselApi}
          >
            <CarouselContent>
              {carouselItems.map((item, index) => {
                return (
                  <CarouselItem
                    key={item.title}
                    className="h-svh bg-[linear-gradient(163.85deg,#1d2129,#00308f)]"
                  >
                    {item.image ? (
                      <div className="flex h-full items-center justify-center">
                        <div
                          data-index={index}
                          className="item flex flex-col items-center justify-center gap-2"
                        >
                          <h2
                            key={`t${i18n.language}`}
                            className="title text-xl font-semibold text-white"
                          >
                            {t(item.title as never)}
                          </h2>
                          <h4
                            key={`st${i18n.language}`}
                            className="subtitle mb-2 text-sm text-white opacity-80"
                          >
                            {t(item.subtitle as never)}
                          </h4>
                          <img className="cover w-66 lg:w-72" src={item.image} />
                        </div>
                      </div>
                    ) : (
                      <CarouselItem className="h-svh bg-[linear-gradient(163.85deg,#1d2129,#00308f)]">
                        <div className="flex h-full items-center justify-center">
                          <div className="item" data-index={index}>
                            <h2
                              key={`t${i18n.language}`}
                              className="title text-xl font-semibold text-white"
                            >
                              {t(item.title as never)}
                            </h2>
                            <h4
                              key={`st${i18n.language}`}
                              className="subtitle mb-2 text-sm text-white opacity-80"
                            >
                              {t(item.subtitle as never)}
                            </h4>
                            {highlighter ? (
                              <ShikiMagicMove
                                lang={lang}
                                theme={'github-dark-high-contrast'}
                                highlighter={highlighter}
                                code={code}
                                options={{
                                  duration: 800,
                                  stagger: 0.3,
                                  lineNumbers: true,
                                }}
                                className="cover bg-transparent!"
                              />
                            ) : (
                              <div className="cover flex h-78 w-78 items-center justify-center">
                                <Spinner className="size-8 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      </CarouselItem>
                    )}
                  </CarouselItem>
                )
              })}
            </CarouselContent>
          </Carousel>
        }
      </div>
      <div className="flex h-full w-full items-center justify-center lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg tracking-tight">{t('login.button.login')}</CardTitle>
            <CardDescription>{t('login.tips')}</CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm className="space-y-2 sm:w-102" redirectTo={redirect} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
export default Login
