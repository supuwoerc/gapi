'use no memo'

import type { ReactNode } from 'react'

import type { DocumentDetail, DocumentVisibility } from '@/schema/document/document'
import { Calendar, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { DocumentSelectionComments } from './document-selection-comments'

const visibilityMetaClassMap: Record<DocumentVisibility, string> = {
  public: 'border-primary/20 bg-primary/10 text-primary',
  private: 'border-secondary bg-secondary text-secondary-foreground',
  project: 'border-accent bg-accent text-accent-foreground',
}

interface DocumentInfoCardProps {
  document?: DocumentDetail
  loading?: boolean
}

export function DocumentInfoCard({ document, loading }: DocumentInfoCardProps) {
  const { t } = useTranslation('documents')

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-9 w-full max-w-2xl" />
          <Skeleton className="h-5 w-full max-w-3xl" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-7 w-20 rounded-md" />
            <Skeleton className="h-7 w-28 rounded-md" />
            <Skeleton className="h-7 w-36 rounded-md" />
            <Skeleton className="h-7 w-32 rounded-md" />
          </div>
        </div>
        <Card className="gap-4 py-5">
          <CardHeader>
            <Skeleton className="h-6 w-16" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!document) return null

  return (
    <div className="flex flex-col gap-4">
      <header className="flex max-w-5xl flex-col gap-4">
        <div className="flex flex-col gap-3">
          <h2 className="max-w-4xl text-3xl font-semibold tracking-tight break-words text-primary sm:text-4xl">
            {document.title}
          </h2>
          {document.description ? (
            <p className="line-clamp-2 max-w-3xl text-sm leading-6 break-words text-muted-foreground sm:text-base">
              {document.description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <MetaItem className={visibilityMetaClassMap[document.visibility]}>
            <Eye className="size-4" />
            {t(`visibility.${document.visibility}`)}
          </MetaItem>
          <MetaItem>
            <Calendar className="size-4 text-muted-foreground" />
            {document.created_at.toLocaleDateString()}
          </MetaItem>
          <MetaItem>
            <Avatar size="sm">
              <AvatarImage src={document.project.logo} alt={document.project.name} />
              <AvatarFallback>{document.project.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="truncate">{document.project.name}</span>
          </MetaItem>
          <MetaItem>
            <Avatar size="sm">
              <AvatarImage src={document.owner.avatar} alt={document.owner.username} />
              <AvatarFallback>{document.owner.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="truncate">{document.owner.username}</span>
          </MetaItem>
        </div>
      </header>

      {document.content ? (
        <DocumentSelectionComments documentId={document.id} content={document.content} />
      ) : (
        <Card className="gap-4 py-5">
          <CardHeader>
            <CardTitle>{t('detail.content')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('detail.noContent')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function MetaItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'inline-flex max-w-full min-w-0 items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm',
        className
      )}
    >
      <span className="flex min-w-0 items-center gap-1.5 font-medium">{children}</span>
    </div>
  )
}
