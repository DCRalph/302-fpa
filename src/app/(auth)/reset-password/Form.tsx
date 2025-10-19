'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '~/trpc/react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const resetPassword = api.auth.resetPassword.useMutation({
    onSuccess: () => {
      setIsSuccess(true);
    },
    onError: (error) => {
      console.error('Password reset failed:', error);
    },
  });

  useEffect(() => {
    if (!token) {
      router.push('/forgot-password');
      return;
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || password !== confirmPassword) return;

    resetPassword.mutate({ token, password });
  };


  if (isSuccess) {
    return (
      <div className="bg-background z-20 w-full max-w-md rounded-lg p-8 shadow-lg">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold">Account ready!</h1>
            <p className="text-muted-foreground">
              Your account has been set up successfully. You can now sign in.
            </p>
          </div>
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                You can now sign in with your new password.
              </AlertDescription>
            </Alert>
            <Button asChild className="w-full">
              <Link href="/signin">
                Sign in to your account
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
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Set your password</h1>
          <p className="text-muted-foreground">
            Enter your new password below to complete your account setup.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              minLength={8}
              disabled={resetPassword.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={8}
              disabled={resetPassword.isPending}
            />
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-red-600">Passwords do not match</p>
            )}
          </div>

          {resetPassword.error && (
            <Alert variant="destructive">
              <AlertDescription>
                {resetPassword.error.message === 'Invalid or expired reset token'
                  ? 'This password reset link is invalid or has expired. Please request a new one.'
                  : resetPassword.error.message
                }
                {resetPassword.error.message === 'Invalid or expired reset token' && (
                  <div className="mt-2">
                    <Button variant="outline" asChild size="sm">
                      <Link href="/forgot-password">
                        Request new reset link
                      </Link>
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={
              resetPassword.isPending ||
              !password ||
              !confirmPassword ||
              password !== confirmPassword ||
              password.length < 8
            }
          >
            {resetPassword.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting password...
              </>
            ) : (
              'Reset password'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
