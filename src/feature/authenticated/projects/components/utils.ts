export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
}
