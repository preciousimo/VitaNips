// src/components/common/LanguageSwitcher.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
];

const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="relative">
            <select
                value={i18n.resolvedLanguage}
                onChange={(e) => changeLanguage(e.target.value)}
                className="input-field py-1 px-2 text-sm appearance-none pr-8 rounded-md bg-white border-gray-300 focus:border-primary focus:ring-primary"
            >
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.name}
                    </option>
                ))}
            </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
    );
};
export default LanguageSwitcher;