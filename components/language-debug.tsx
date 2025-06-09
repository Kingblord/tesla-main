"use client"

import { useLanguage } from "@/contexts/language-context"

export default function LanguageDebug() {
  const { language, t } = useLanguage()

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs z-50">
      <div>Current Language: {language}</div>
      <div>Test Translation: {t("nav.plans")}</div>
    </div>
  )
}
