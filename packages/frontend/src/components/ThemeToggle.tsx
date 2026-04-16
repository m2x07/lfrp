import { useState } from 'react';
import { MoonIcon, SunIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

function getInitialTheme(): boolean {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(dark: boolean) {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
}

export function ThemeToggle() {
    const [dark, setDark] = useState(getInitialTheme);

    function toggle() {
        const next = !dark;
        setDark(next);
        applyTheme(next);
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label="Toggle theme"
            className="text-primary-foreground hover:bg-primary-foreground/10">
            {dark ? <SunIcon /> : <MoonIcon />}
        </Button>
    );
}
