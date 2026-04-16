import { useMemo } from 'react';
import { useLocation } from 'wouter';
import { LogOutIcon, UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ThemeToggle';

const AVATAR_COLORS = [
    'bg-rose-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-pink-500',
];

function getEmailFromToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.email || null;
    } catch {
        return null;
    }
}

function getColorForEmail(email: string): string {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
        hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function Header() {
    const [, setLocation] = useLocation();

    const email = useMemo(() => getEmailFromToken(), []);
    const avatarColor = email ? getColorForEmail(email) : 'bg-muted';

    function handleLogout() {
        localStorage.removeItem('token');
        setLocation('/login');
    }

    return (
        <header className="bg-primary text-primary-foreground flex items-center justify-between px-6 py-3">
            <span className="text-lg font-semibold">LFRP</span>
            <div className="flex items-center gap-1">
                <ThemeToggle />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button aria-label="User menu">
                            <Avatar className={avatarColor}>
                                <AvatarFallback>
                                    <UserIcon
                                        className="text-primary-foreground"
                                        color="#C10007"
                                    />
                                </AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <div className="flex flex-col items-center gap-2 p-4">
                            <Avatar size="lg" className={avatarColor}>
                                <AvatarFallback>
                                    <UserIcon
                                        className="text-primary-foreground"
                                        color="#C10007"
                                    />
                                </AvatarFallback>
                            </Avatar>
                            <p className="text-sm font-medium text-center break-all">
                                {email}
                            </p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={handleLogout}>
                            <LogOutIcon />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
