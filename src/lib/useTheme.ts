'use client';

import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

const DARK = {
  axisFill: '#4b4855',
  gridStroke: 'rgba(255, 255, 255, 0.03)',
  cursorStroke: 'rgba(255, 255, 255, 0.06)',
  refStroke: 'rgba(255, 255, 255, 0.15)',
  bgHex: '#0a0a0f',
  purple: '#6100ff',
  purpleDim: '#270067',
  teal: '#1fe9d1',
  tealDim: '#006458',
  refLabel: '#a8a4b7',
  tooltipBg: 'rgba(30, 28, 36, 0.96)',
  tooltipBorder: 'rgba(75, 72, 85, 1)',
};

const LIGHT = {
  axisFill: '#9e99ad',
  gridStroke: 'rgba(0, 0, 0, 0.06)',
  cursorStroke: 'rgba(0, 0, 0, 0.08)',
  refStroke: 'rgba(0, 0, 0, 0.15)',
  bgHex: '#f7f5fa',
  purple: '#6100ff',
  purpleDim: '#d4bfff',
  teal: '#0db8a3',
  tealDim: '#a3e8df',
  refLabel: '#7d7891',
  tooltipBg: 'rgba(255, 255, 255, 0.96)',
  tooltipBorder: 'rgba(221, 216, 230, 1)',
};

export function useThemeColors() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const check = () => {
      const t = document.body.getAttribute('data-theme') as Theme;
      setTheme(t === 'light' ? 'light' : 'dark');
    };
    check();

    const observer = new MutationObserver(check);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return theme === 'light' ? LIGHT : DARK;
}
