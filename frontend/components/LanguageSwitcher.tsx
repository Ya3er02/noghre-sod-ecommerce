import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { changeLanguage } from '../lib/i18n/config';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  dir: 'rtl' | 'ltr';
  flag: string;
}

const languages: Language[] = [
  {
    code: 'fa',
    name: 'Persian',
    nativeName: 'فارسی',
    dir: 'rtl',
    flag: '🇮🇷',
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    dir: 'rtl',
    flag: '🇦🇪',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    dir: 'ltr',
    flag: '🇬🇧',
  },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = async (langCode: string) => {
    await changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn--secondary flex items-center gap-2 min-w-[140px]"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <Globe size={20} />
        <span className="font-medium">{currentLanguage.nativeName}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div
            className="absolute top-full mt-2 min-w-[200px] bg-white dark:bg-gray-800 
                     rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 
                     py-2 z-50"
            style={{
              [currentLanguage.dir === 'rtl' ? 'right' : 'left']: 0,
            }}
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={
                  `w-full px-4 py-3 flex items-center justify-between gap-3 
                   hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                   ${i18n.language === lang.code ? 'bg-gray-50 dark:bg-gray-750' : ''}`
                }
                dir={lang.dir}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-label={lang.name}>
                    {lang.flag}
                  </span>
                  <div className="text-start">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {lang.nativeName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {lang.name}
                    </div>
                  </div>
                </div>

                {i18n.language === lang.code && (
                  <Check size={18} className="text-primary" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
