import { useEffect, useRef } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { LoginUser } from '@/schema/auth/auth'
import { patchTour } from '@/service/user/user'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { produce } from 'immer'
import { useTranslation } from 'react-i18next'

import { markTourCompleted, useLoginUserStore } from '@/store/login-user'

import { CURRENT_TOUR_VERSION } from './constants'

export function useTour() {
  const { t } = useTranslation('component')
  const loginUser = useLoginUserStore((state) => state.loginUser)
  const queryClient = useQueryClient()
  const initialized = useRef(false)

  const { mutate } = useMutation({
    mutationFn: patchTour,
    onSuccess: () => {
      markTourCompleted(CURRENT_TOUR_VERSION)
      queryClient.setQueryData(
        ['userProfile'],
        produce((draft: LoginUser | undefined) => {
          if (draft) {
            draft.completed_tours = [...(draft.completed_tours ?? []), CURRENT_TOUR_VERSION]
          }
        })
      )
    },
  })

  useEffect(() => {
    if (initialized.current) return
    if (!loginUser) return
    if (loginUser.completed_tours?.includes(CURRENT_TOUR_VERSION)) return

    initialized.current = true

    const instance = driver({
      showProgress: true,
      progressText: t('tour.progress'),
      nextBtnText: t('tour.next'),
      prevBtnText: t('tour.prev'),
      doneBtnText: t('tour.done'),
      steps: [
        {
          element: '[data-slot="sidebar"]',
          popover: {
            title: t('tour.sidebar.title'),
            description: t('tour.sidebar.description'),
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '[data-tour="search"]',
          popover: {
            title: t('tour.search.title'),
            description: t('tour.search.description'),
          },
        },
        {
          element: '[data-tour="theme-mode"]',
          popover: {
            title: t('tour.themeMode.title'),
            description: t('tour.themeMode.description'),
          },
        },
        {
          element: '[data-tour="language-switcher"]',
          popover: {
            title: t('tour.language.title'),
            description: t('tour.language.description'),
          },
        },
        {
          element: '[data-tour="config-drawer"]',
          popover: {
            title: t('tour.configDrawer.title'),
            description: t('tour.configDrawer.description'),
          },
        },
      ],
      onDestroyed: () => {
        mutate({ completed_tours: [CURRENT_TOUR_VERSION] })
      },
    })

    const timer = setTimeout(() => instance.drive(), 600)

    return () => {
      clearTimeout(timer)
      instance.destroy()
      initialized.current = false
    }
  }, [loginUser, t, mutate])
}
