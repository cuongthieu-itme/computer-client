// src/components/LanguageSelector.tsx
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Globe } from 'lucide-react';
import { useLanguage, Language } from '@/contexts/LanguageContext'; // Import Language type

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; name: string }[] = [ // Use Language type here
    { code: 'en', name: 'English' },
    { code: 'ms', name: 'Bahasa Malaysia' },
    { code: 'zh-CN', name: '简体中文' },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Select Language">
          <Globe size={18} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2">
        <div className="space-y-1">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant={language === lang.code ? "secondary" : "ghost"}
              className="w-full justify-start"
              // Ensure the correct language code is passed
              onClick={() => setLanguage(lang.code)}
            >
              {lang.name}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LanguageSelector;