export function formatDate(
  date: Date | string | number | undefined,
  opts: Intl.DateTimeFormatOptions = {},
  locale?: string
) {
  if (!date) return ''

  try {
    const defaultOptions =
      opts.dateStyle || opts.timeStyle
        ? {}
        : {
            month: opts.month ?? 'long',
            day: opts.day ?? 'numeric',
            year: opts.year ?? 'numeric',
          }

    return new Intl.DateTimeFormat(locale ?? 'en-US', {
      ...defaultOptions,
      ...opts,
    }).format(new Date(date))
  } catch (_err) {
    return ''
  }
}
