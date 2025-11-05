'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '~/components/ui/button';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailForm() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const error = searchParams.get('error') ?? '';

  useEffect(() => {
    // Check if verification was successful or failed via query params
    if (error) {
      setStatus('error');
      setMessage(error === 'invalid_token'
        ? 'This verification link is invalid or has expired.'
        : 'Email verification failed. Please try again.');
    } else if (token) {
      // Token is present, Better Auth should have handled verification
      setStatus('success');
      setMessage('Your email has been verified successfully!');
    } else {
      // No token - show error message without requiring authentication
      setStatus('error');
      setMessage('No verification token provided. Please check your email for the verification link or request a new verification email.');
    }
  }, [token, error]);

  if (status === 'loading') {
    return (
      <div className="bg-background z-20 w-full max-w-md rounded-lg p-8 shadow-lg">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold">Verifying your email...</h1>
            <p className="text-muted-foreground">
              Please wait while we verify your email address.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="bg-background z-20 w-full max-w-md rounded-lg p-8 shadow-lg">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold">Email verified!</h1>
            <p className="text-muted-foreground">
              {message}
            </p>
          </div>
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                You can now access all features of your account.
              </AlertDescription>
            </Alert>
            <Button asChild className="w-full">
              <Link href="/member-dashboard/profile">
                Go to Profile
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background z-20 w-full max-w-md rounded-lg p-8 shadow-lg">
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold">Verification failed</h1>
          <p className="text-muted-foreground">
            {message}
          </p>
        </div>
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {message}
            </AlertDescription>
          </Alert>
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/member-dashboard/profile">
                Go to Profile
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/signin">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
