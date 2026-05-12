import { useTranslation } from 'react-i18next'

import { clearLoginUserState } from '@/store/login-user'

import ConfirmDialog from './confirm-dialog'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const { t } = useTranslation('component')

  const handleSignOut = () => {
    // 清除登录状态后 router 自动重建，layout 路由的 requireAuth loader 会拦截并 redirect 到 /login
    // After clearing login state, the router rebuilds automatically and the requireAuth loader on layout routes redirects to /login
    clearLoginUserState()
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
