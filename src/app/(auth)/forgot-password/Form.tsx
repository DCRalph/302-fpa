"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const requestPasswordReset = api.auth.requestPasswordReset.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
    },
    onError: (error) => {
      console.error("Password reset request failed:", error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    requestPasswordReset.mutate({ email });
  };

  if (isSubmitted) {
    return (
      <div className="bg-background z-20 w-full max-w-md rounded-lg p-8 shadow-lg">
        <div className="space-y-6">
          <div className="space-y-4 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold">Check your email</h1>
            <p className="text-muted-foreground">
              We&apos;ve sent a password reset link to your email address.
            </p>
          </div>
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                You&apos;ll receive a password reset link shortly. If this is
                your first time, we&apos;ll create an account for you.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col space-y-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                }}
                className="w-full"
              >
                Try another email
              </Button>
              <Button variant="ghost" asChild className="w-full">
                <Link href="/signin">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to sign in
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background z-20 w-full max-w-md rounded-lg p-8 shadow-lg">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Forgot your password?</h1>
          <p className="text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to set your
            password.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={requestPasswordReset.isPending}
            />
          </div>

          {requestPasswordReset.error && (
            <Alert variant="destructive">
              <AlertDescription>
                {requestPasswordReset.error.message}
              </AlertDescription>
            </Alert>
          )}

          <Button
            variant={"primary"}
            type="submit"
            className="w-full"
            disabled={requestPasswordReset.isPending || !email}
          >
            {requestPasswordReset.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reset link...
              </>
            ) : (
              "Send reset link"
            )}
          </Button>

          <div className="text-center">
            <Button variant="ghost" asChild>
              <Link href="/signin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
