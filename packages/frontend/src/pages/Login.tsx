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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';

function Login() {
    const [, setLocation] = useLocation();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showOtpDialog, setShowOtpDialog] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

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
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Login failed.');
            }

            setShowOtpDialog(true);
            toast.success('Check your email for the verification code.');
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Login failed.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleVerify() {
        if (otp.length !== 6) {
            setOtpError('Enter the 6-digit code.');
            return;
        }

        setOtpError('');
        setIsVerifying(true);

        try {
            const res = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: Number(otp) }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Verification failed.');
            }

            localStorage.setItem('token', data.authToken);
            setShowOtpDialog(false);
            setLocation('/');
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Verification failed.';
            setOtpError(message);
        } finally {
            setIsVerifying(false);
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

            <Dialog
                open={showOtpDialog}
                onOpenChange={(open) => {
                    setShowOtpDialog(open);
                    if (!open) {
                        setOtp('');
                        setOtpError('');
                    }
                }}>
                <DialogContent showCloseButton={!isVerifying}>
                    <DialogHeader>
                        <DialogTitle>Enter verification code</DialogTitle>
                        <DialogDescription>
                            We sent a 6-digit code to {email}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4">
                        <InputOTP
                            maxLength={6}
                            value={otp}
                            onChange={(value) => {
                                setOtp(value);
                                if (otpError) setOtpError('');
                            }}
                            aria-invalid={!!otpError}
                            disabled={isVerifying}>
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                        {otpError && <FieldError>{otpError}</FieldError>}
                        <Button
                            className="w-full"
                            onClick={handleVerify}
                            disabled={isVerifying}>
                            {isVerifying && (
                                <Spinner data-icon="inline-start" />
                            )}
                            Verify
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default Login;
