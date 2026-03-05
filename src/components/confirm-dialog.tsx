import type { FC } from 'react'

import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open: boolean
  title: React.ReactNode
  disabled?: boolean
  desc: React.JSX.Element | string
  cancelBtnText?: string
  confirmText?: React.ReactNode
  destructive?: boolean
  isLoading?: boolean
  className?: string
  children?: React.ReactNode
  handleConfirm: () => void
  onOpenChange: (open: boolean) => void
}

const ConfirmDialog: FC<ConfirmDialogProps> = ({
  title,
  desc,
  children,
  className,
  confirmText,
  cancelBtnText,
  destructive,
  isLoading,
  disabled = false,
  handleConfirm,
  ...actions
}) => {
  const { t } = useTranslation()
  return (
    <AlertDialog {...actions}>
      <AlertDialogContent className={cn(className && className)}>
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>{desc}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelBtnText ?? t('common.button.cancel')}
          </AlertDialogCancel>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={disabled || isLoading}
          >
            {confirmText ?? t('common.button.continue')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConfirmDialog
