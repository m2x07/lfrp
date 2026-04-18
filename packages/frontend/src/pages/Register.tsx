import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
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
import { Spinner } from '@/components/ui/spinner';

const formSchema = z.object({
    email: z.string().email('Enter a valid email address.'),
    name: z.string().min(1, 'Name is required.'),
    contactNumber: z.preprocess(
        (val) => (val === '' || val === undefined ? undefined : Number(val)),
        z
            .number('Contact must be a number')
            .int('Contact number must be a whole number')
            .min(1111111111, 'Contact number invalid')
    ),
});

function Register() {
    const [, setLocation] = useLocation();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as Resolver<
            z.infer<typeof formSchema>
        >,
        defaultValues: {
            email: '',
            name: '',
            contactNumber: undefined,
        },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || 'Registration failed.');
            }

            toast.success(result.message);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Registration failed.';
            toast.error(message);
        }
    }

    return (
        <div className="flex min-h-svh items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Register</CardTitle>
                    <CardDescription>
                        Create your account to get started.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup>
                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="register-email">
                                            Email
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="register-email"
                                            type="email"
                                            placeholder="you@example.com"
                                            aria-invalid={fieldState.invalid}
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
                                name="name"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="register-name">
                                            Name
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="register-name"
                                            placeholder="Vivek Patel"
                                            aria-invalid={fieldState.invalid}
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
                                name="contactNumber"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="register-contact">
                                            Contact Number
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="register-contact"
                                            type="tel"
                                            placeholder="91xxxxxx89"
                                            aria-invalid={fieldState.invalid}
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
                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && (
                                    <Spinner data-icon="inline-start" />
                                )}
                                Register
                            </Button>
                        </FieldGroup>
                    </form>
                </CardContent>
                <CardFooter>
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Button
                            variant="link"
                            className="h-auto px-0"
                            onClick={() => setLocation('/login')}>
                            Login
                        </Button>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

export default Register;
