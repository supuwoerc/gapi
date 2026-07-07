'use no memo'

import { useEffect } from 'react'

import { useQuery } from '@tanstack/react-query'

import { getDocumentDetail } from '@/service/documents/detail'
import { useParams } from 'react-router'

import { ConfigDrawer } from '@/components/config-drawer'
import { LanguageSwitcher } from '@/components/language-switcher'
import AppHeader from '@/components/layout/authenticated/app-header'
import AppMain from '@/components/layout/authenticated/app-main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import Search from '@/components/search'
import { ThemeModeSwitcher } from '@/components/theme-mode-switcher'

import { DocumentInfoCard } from './components/document-info-card'

const DocumentDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const documentId = Number(id)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const { data: detail, isLoading } = useQuery({
    queryKey: ['document-detail', documentId],
    queryFn: () => getDocumentDetail({ id: documentId }),
    enabled: !Number.isNaN(documentId),
  })

  const document = detail?.data

  return (
    <>
      <AppHeader fixed>
        <Search />
        <div className="ms-auto flex items-center gap-4">
          <ThemeModeSwitcher />
          <LanguageSwitcher />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </AppHeader>
      <AppMain className="flex flex-col gap-4 sm:gap-6">
        <DocumentInfoCard document={document} loading={isLoading} />
      </AppMain>
    </>
  )
}

export default DocumentDetailPage
