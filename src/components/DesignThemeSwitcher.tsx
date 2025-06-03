
import React from 'react';
import { useDesignTheme } from '@/contexts/DesignThemeContext';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const DesignThemeSwitcher = () => {
  const { designTheme, setDesignTheme } = useDesignTheme();

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-medium">Design Theme</span>
      <ToggleGroup type="single" value={designTheme} onValueChange={(value) => {
        if (value) setDesignTheme(value as "typeA" | "typeB" | "typeC");
      }}>
        <ToggleGroupItem value="typeA" className="px-3">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#000]"></span>
            Type A
          </span>
        </ToggleGroupItem>
        {/* <ToggleGroupItem value="typeB" className="px-3">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#7A8450]"></span>
            <span className="w-3 h-3 rounded-full bg-[#CE1126]"></span>
            Jungle
          </span>
        </ToggleGroupItem> */}
        <ToggleGroupItem value="typeC" className="px-3">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#002B7F]"></span>
            Type B
          </span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default DesignThemeSwitcher;
