import { useDeferredValue, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { useLocation } from 'wouter';
import { Post } from '@/components/Post';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    NativeSelect,
    NativeSelectOption,
} from '@/components/ui/native-select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const CATEGORIES = [
    'ALL',
    'VALUABLES',
    'JEWELLERY',
    'APPARELS',
    'EDUCATIONAL',
    'ELECTRONICS',
] as const;

type Category = (typeof CATEGORIES)[number];

interface PostData {
    id: number;
    title: string;
    content: string | null;
    type: 'LOST' | 'FOUND';
    location: string;
    createdAt: string;
    author: { name: string } | null;
    attachments: string[];
}

function getRelativeTime(dateString: string): string {
    const now = Date.now();
    const then = new Date(dateString).getTime();
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hr ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    return new Date(dateString).toLocaleDateString();
}

async function fetchPosts(
    type: string,
    category: string,
    search: string
): Promise<PostData[]> {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({ type });
    if (category !== 'ALL') params.set('category', category);
    if (search.trim()) params.set('search', search.trim());
    const res = await fetch(`http://localhost:3000/api/post?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch posts.');
    return res.json();
}

export function PostList() {
    const [, setLocation] = useLocation();
    const [type, setType] = useState<'LOST' | 'FOUND'>('FOUND');
    const [category, setCategory] = useState<Category>('ALL');
    const [search, setSearch] = useState('');
    const deferredSearch = useDeferredValue(search);

    const { data: posts, isLoading } = useQuery({
        queryKey: ['posts', type, category, deferredSearch],
        queryFn: () => fetchPosts(type, category, deferredSearch),
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="relative max-w-150">
                <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search posts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>
            <div className="flex items-center gap-3 max-w-150">
                <ToggleGroup
                    type="single"
                    value={type}
                    onValueChange={(val) => {
                        if (val) setType(val as 'LOST' | 'FOUND');
                    }}
                    variant="outline">
                    <ToggleGroupItem value="FOUND">Found</ToggleGroupItem>
                    <ToggleGroupItem value="LOST">Lost</ToggleGroupItem>
                </ToggleGroup>
                <NativeSelect
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}>
                    {CATEGORIES.map((cat) => (
                        <NativeSelectOption key={cat} value={cat}>
                            {cat === 'ALL'
                                ? 'All Categories'
                                : cat.charAt(0) + cat.slice(1).toLowerCase()}
                        </NativeSelectOption>
                    ))}
                </NativeSelect>
                <Button
                    variant="default"
                    className="ml-auto"
                    onClick={() => setLocation('/new')}>
                    <PlusIcon data-icon="inline-start" />
                    New Post
                </Button>
            </div>

            {isLoading && (
                <p className="text-sm text-muted-foreground text-center py-8">
                    Loading posts...
                </p>
            )}

            {!isLoading && posts?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                    No {type.toLowerCase()} posts yet.
                </p>
            )}

            {posts?.map((post) => (
                <Post
                    key={post.id}
                    userName={post.author?.name ?? 'Unknown'}
                    status={post.type}
                    title={post.title}
                    description={post.content ?? ''}
                    location={post.location}
                    timestamp={getRelativeTime(post.createdAt)}
                    images={post.attachments}
                />
            ))}
        </div>
    );
}
