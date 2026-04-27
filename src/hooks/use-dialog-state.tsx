import { useState } from 'react'

/**
 * 确认对话框状态管理 hook
 * Custom hook for confirm dialog state management
 *
 * @param initialState - 初始状态值 / Initial state value
 * @returns 状态值及其更新函数 / A stateful value and a function to update it
 * @example const [open, setOpen] = useDialogState<"approve" | "reject">()
 */
export default function useDialogState<T extends string | boolean>(initialState: T | null = null) {
  const [open, _setOpen] = useState<T | null>(initialState)

  const setOpen = (str: T | null) => _setOpen((prev) => (prev === str ? null : str))

  return [open, setOpen] as const
}
