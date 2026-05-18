import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export type Locale = 'az' | 'ru' | 'en'
export const locales: Locale[] = ['az', 'ru', 'en']
export const defaultLocale: Locale = 'az'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const raw = cookieStore.get('locale')?.value ?? defaultLocale
  const locale = locales.includes(raw as Locale) ? (raw as Locale) : defaultLocale
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
