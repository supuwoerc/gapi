'use no memo'

import type { DocumentDetail } from '@/schema/document/document'
import { Calendar, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { ReadOnlyEditor } from '@/components/lexical/read-only-editor'

const visibilityVariantMap = {
  public: 'default',
  private: 'secondary',
  project: 'outline',
} as const

interface DocumentInfoCardProps {
  document?: DocumentDetail
  loading?: boolean
}

export function DocumentInfoCard({ document, loading }: DocumentInfoCardProps) {
  const { t } = useTranslation(['document-detail', 'documents'])

  if (loading) {
    return (
      <div className="space-y-3">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
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
    <div className="space-y-3">
      <Card className="gap-1 py-4">
        <CardHeader>
          <CardTitle>{t('info')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          <InfoItem
            label={t('fields.visibility')}
            value={
              <div className="flex items-center gap-1">
                <Eye className="size-4 text-muted-foreground" />
                <Badge variant={visibilityVariantMap[document.visibility]}>
                  {t(`documents:visibility.${document.visibility}`)}
                </Badge>
              </div>
            }
          />
          <InfoItem
            label={t('fields.project')}
            value={
              <div className="flex items-center gap-2">
                <Avatar className="size-5">
                  <AvatarImage src={document.project.logo} alt={document.project.name} />
                  <AvatarFallback className="text-[10px]">
                    {document.project.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>{document.project.name}</span>
              </div>
            }
          />
          <InfoItem
            label={t('fields.owner')}
            value={
              <div className="flex items-center gap-2">
                <Avatar className="size-5">
                  <AvatarImage src={document.owner.avatar} alt={document.owner.username} />
                  <AvatarFallback className="text-[10px]">
                    {document.owner.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{document.owner.username}</span>
              </div>
            }
          />
          <InfoItem
            label={t('fields.createdAt')}
            value={
              <span className="flex items-center gap-1">
                <Calendar className="size-4 text-muted-foreground" />
                {document.created_at.toLocaleDateString()}
              </span>
            }
          />
        </CardContent>
      </Card>

      <Card className="gap-1 py-4">
        <CardHeader>
          <CardTitle>{t('content')}</CardTitle>
        </CardHeader>
        <CardContent>
          {document.content ? (
            <ReadOnlyEditor content={document.content} />
          ) : (
            <p className="text-muted-foreground">{t('noContent')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )
}
