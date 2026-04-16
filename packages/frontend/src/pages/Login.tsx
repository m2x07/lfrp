import { useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
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

function Login() {
    const [, setLocation] = useLocation();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    function validate(value: string): string {
        if (!value.trim()) return 'Email is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
            return 'Enter a valid email address.';
        return '';
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const validationError = validate(email);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Login failed.');
            }

            localStorage.setItem('token', data.auth_token);
            setLocation('/');
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Login failed.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-svh items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>
                        Enter your email to sign in to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
                            <Field data-invalid={!!error}>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (error) setError('');
                                    }}
                                    aria-invalid={!!error}
                                    disabled={isLoading}
                                />
                                {error && <FieldError>{error}</FieldError>}
                            </Field>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && (
                                    <Spinner data-icon="inline-start" />
                                )}
                                Login
                            </Button>
                        </FieldGroup>
                    </form>
                </CardContent>
                <CardFooter>
                    <p className="text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Button
                            variant="link"
                            className="h-auto px-0"
                            onClick={() => setLocation('/register')}>
                            Register
                        </Button>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

export default Login;
