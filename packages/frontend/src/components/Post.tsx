import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    MoreVerticalIcon,
    PencilIcon,
    Trash2Icon,
    UserIcon,
} from 'lucide-react';

interface PostProps {
    id: number;
    userName: string;
    contactNumber: number | null;
    authorEmail: string | null;
    currentUserEmail: string | null;
    status: 'FOUND' | 'LOST';
    title: string;
    description: string;
    location: string;
    category: string | null;
    timestamp: string;
    images: string[];
}

export function Post({
    id,
    userName,
    contactNumber,
    authorEmail,
    currentUserEmail,
    status,
    title,
    description,
    location,
    category,
    timestamp,
    images,
}: PostProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [, setLocation] = useLocation();
    const queryClient = useQueryClient();

    const isOwner =
        authorEmail !== null &&
        currentUserEmail !== null &&
        authorEmail === currentUserEmail;

    async function handleDelete() {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/post/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to delete post.');
            }
            toast.success('Post deleted.');
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Failed to delete post.';
            toast.error(message);
        }
    }

    function handleEdit() {
        setLocation('/update', {
            state: {
                id,
                title,
                content: description,
                location,
                category,
                type: status,
                attachments: images,
            },
        });
    }

    return (
        <>
            <Card className="max-w-150 w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Avatar size="sm">
                            <AvatarFallback>
                                <UserIcon />
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{userName}</span>
                    </div>
                    {isOwner && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button aria-label="Post options">
                                    <MoreVerticalIcon className="size-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleEdit}>
                                    <PencilIcon />
                                    Edit post
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={handleDelete}>
                                    <Trash2Icon />
                                    Delete post
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </CardHeader>
                <div className="flex aspect-video overflow-hidden">
                    <div className="w-1/2 overflow-hidden">
                        {images[0] ? (
                            <img
                                src={`/uploads/images/${images[0]}`}
                                alt=""
                                className="size-full cursor-pointer object-cover"
                                onClick={() => setPreview(images[0])}
                            />
                        ) : (
                            <div className="size-full bg-muted" />
                        )}
                    </div>
                    <div className="w-1/2 overflow-hidden">
                        {images[1] ? (
                            <img
                                src={`/uploads/images/${images[1]}`}
                                alt=""
                                className="size-full cursor-pointer object-cover"
                                onClick={() => setPreview(images[1])}
                            />
                        ) : (
                            <div className="size-full bg-muted" />
                        )}
                    </div>
                </div>
                <CardContent>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                    {contactNumber !== null && (
                        <p className="text-sm mt-2">Contact: {contactNumber}</p>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Badge variant="outline">{location}</Badge>
                    <Badge variant="secondary">{timestamp}</Badge>
                </CardFooter>
            </Card>

            {preview && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                    onClick={() => setPreview(null)}>
                    <img
                        src={`/uploads/images/${preview}`}
                        alt=""
                        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}
