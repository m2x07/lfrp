import { useState } from 'react';
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
import { UserIcon } from 'lucide-react';

interface PostProps {
    userName: string;
    status: 'FOUND' | 'LOST';
    title: string;
    description: string;
    location: string;
    timestamp: string;
    images: string[];
}

export function Post({
    userName,
    status,
    title,
    description,
    location,
    timestamp,
    images,
}: PostProps) {
    const [preview, setPreview] = useState<string | null>(null);

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
                    <Badge
                        variant={
                            status === 'FOUND' ? 'default' : 'destructive'
                        }>
                        {status}
                    </Badge>
                </CardHeader>
                <div className="flex aspect-video overflow-hidden">
                    <div className="w-1/2 overflow-hidden">
                        {images[0] ? (
                            <img
                                src={`http://localhost:3000/uploads/images/${images[0]}`}
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
                                src={`http://localhost:3000/uploads/images/${images[1]}`}
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
                        src={`http://localhost:3000/uploads/images/${preview}`}
                        alt=""
                        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}
