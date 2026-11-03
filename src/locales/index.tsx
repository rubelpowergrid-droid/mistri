'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import bn from './bn.json'
import en from './en.json'

type Language = 'bn' | 'en'

interface I18nContextType {
  lang: Language
  setLanguage: (lang: Language) => void
  t: (keyPath: string, defaultValue?: string) => string
}

const translations: Record<Language, any> = { bn, en }

const I18nContext = createContext<I18nContextType>({
  lang: 'bn',
  setLanguage: () => {},
  t: (keyPath: string) => keyPath,
})

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('bn')

  useEffect(() => {
    const saved = localStorage.getItem('mistri_lang') as Language
    if (saved && (saved === 'bn' || saved === 'en')) {
      setLangState(saved)
    }
  }, [])

  const setLanguage = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem('mistri_lang', newLang)
  }

  const t = (keyPath: string, defaultValue?: string): string => {
    const keys = keyPath.split('.')
    let current = translations[lang]

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        let fallback = translations.en
        for (const fbKey of keys) {
          if (fallback && typeof fallback === 'object' && fbKey in fallback) {
            fallback = fallback[fbKey]
          } else {
            return defaultValue || keyPath
          }
        }
        return typeof fallback === 'string' ? fallback : defaultValue || keyPath
      }
    }

    return typeof current === 'string' ? current : defaultValue || keyPath
  }

  return (
    <I18nContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}

