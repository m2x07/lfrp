import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import * as z from 'zod';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    NativeSelect,
    NativeSelectOption,
} from '@/components/ui/native-select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const CATEGORIES = [
    'VALUABLES',
    'JEWELLERY',
    'APPARELS',
    'EDUCATIONAL',
    'ELECTRONICS',
] as const;

const formSchema = z.object({
    title: z.string().min(1, 'Title is required.'),
    content: z.string().min(1, 'Description is required.'),
    location: z.string().min(1, 'Location is required.'),
    category: z.enum(CATEGORIES, { message: 'Category is required.' }),
    type: z.enum(['LOST', 'FOUND'], { message: 'Type is required.' }),
    images: z.any().optional(),
});

function NewPost() {
    const [, setLocation] = useLocation();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            content: '',
            location: '',
            type: 'FOUND',
        },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('content', data.content);
        formData.append('location', data.location);
        formData.append('category', data.category);
        formData.append('type', data.type);

        const fileInput = document.getElementById(
            'newpost-images'
        ) as HTMLInputElement | null;
        if (fileInput?.files) {
            for (let i = 0; i < fileInput.files.length; i++) {
                formData.append('images', fileInput.files[i]);
            }
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/post', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || 'Failed to create post.');
            }

            toast.success('Post created successfully.');
            setLocation('/');
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Failed to create post.';
            toast.error(message);
        }
    }

    return (
        <div>
            <Header />
            <div className="flex justify-center p-6">
                <Card className="w-full max-w-[700px]">
                    <CardHeader>
                        <CardTitle>Create New Post</CardTitle>
                        <CardDescription>
                            Report a lost or found item.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <FieldGroup>
                                <Controller
                                    name="type"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field
                                            data-invalid={fieldState.invalid}>
                                            <FieldLabel>Type</FieldLabel>
                                            <ToggleGroup
                                                type="single"
                                                value={field.value}
                                                onValueChange={(val) => {
                                                    if (val)
                                                        field.onChange(val);
                                                }}
                                                variant="outline">
                                                <ToggleGroupItem value="FOUND">
                                                    Found
                                                </ToggleGroupItem>
                                                <ToggleGroupItem value="LOST">
                                                    Lost
                                                </ToggleGroupItem>
                                            </ToggleGroup>
                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    )}
                                />
                                <Controller
                                    name="title"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field
                                            data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="newpost-title">
                                                Title
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="newpost-title"
                                                placeholder="e.g. Blue Wallet"
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                disabled={
                                                    form.formState.isSubmitting
                                                }
                                            />
                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    )}
                                />
                                <Controller
                                    name="content"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field
                                            data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="newpost-content">
                                                Description
                                            </FieldLabel>
                                            <Textarea
                                                {...field}
                                                id="newpost-content"
                                                placeholder="Describe the item..."
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                disabled={
                                                    form.formState.isSubmitting
                                                }
                                            />
                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    )}
                                />
                                <Controller
                                    name="location"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field
                                            data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="newpost-location">
                                                Location
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="newpost-location"
                                                placeholder="e.g. Main Building, 2nd Floor"
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                disabled={
                                                    form.formState.isSubmitting
                                                }
                                            />
                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    )}
                                />
                                <Controller
                                    name="category"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field
                                            data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="newpost-category">
                                                Category
                                            </FieldLabel>
                                            <NativeSelect
                                                {...field}
                                                id="newpost-category"
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                disabled={
                                                    form.formState.isSubmitting
                                                }>
                                                <NativeSelectOption value="">
                                                    Select a category
                                                </NativeSelectOption>
                                                {CATEGORIES.map((cat) => (
                                                    <NativeSelectOption
                                                        key={cat}
                                                        value={cat}>
                                                        {cat.charAt(0) +
                                                            cat
                                                                .slice(1)
                                                                .toLowerCase()}
                                                    </NativeSelectOption>
                                                ))}
                                            </NativeSelect>
                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    )}
                                />
                                <Field>
                                    <FieldLabel htmlFor="newpost-images">
                                        Images
                                    </FieldLabel>
                                    <Input
                                        id="newpost-images"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        disabled={form.formState.isSubmitting}
                                    />
                                </Field>
                                <Button
                                    type="submit"
                                    disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && (
                                        <Spinner data-icon="inline-start" />
                                    )}
                                    Create Post
                                </Button>
                            </FieldGroup>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default NewPost;
