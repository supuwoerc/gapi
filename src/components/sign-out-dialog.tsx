import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { setLoginUser } from '@/store/login-user'

import ConfirmDialog from './confirm-dialog'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate()
  const { t } = useTranslation('component')

  const handleSignOut = () => {
    setLoginUser(null)
    const currentUrl = location.pathname + location.search + location.hash
    navigate(`/login?redirect=${encodeURIComponent(currentUrl)}`, { replace: true })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('signOutDialog.signOut')}
      desc={t('signOutDialog.tips')}
      confirmText={t('signOutDialog.signOut')}
      destructive
      handleConfirm={handleSignOut}
      className="sm:max-w-sm!"
    />
  )
}
