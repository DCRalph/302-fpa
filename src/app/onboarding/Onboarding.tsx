"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { montserrat } from "~/components/fonts";
import { handleTRPCMutation } from "~/lib/toast";
import { useAuth } from "~/hooks/useAuth";

export default function OnboardingComponent() {
  const router = useRouter();
  const { dbUser } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [school, setSchool] = useState("");
  const [error, setError] = useState("");

  // Prefill name if user already has one
  useEffect(() => {
    if (dbUser?.name) {
      setName(dbUser.name);
    }
  }, [dbUser]);

  const { mutateAsync: completeOnboarding, isPending } = api.onboarding.completeOnboarding.useMutation({
    onSuccess: () => {
      router.push("/member-dashboard");
      router.refresh();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number");
      return;
    }

    if (!school.trim()) {
      setError("Please enter your school");
      return;
    }

    void handleTRPCMutation(() => completeOnboarding({ name, phone, school }), "Onboarding completed successfully", "Failed to complete onboarding");
  };

  return (
    <main className="bg-background text-foreground min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl border p-8">
          <div className="text-center mb-8">
            <h1 className={`${montserrat.className} text-3xl font-bold tracking-tight mb-2`}>
              Welcome! 🎉
            </h1>
            <p className="text-muted-foreground">
              {`Let's complete your profile to get started`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone Number <span className="text-destructive">*</span>
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+679 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                {`We'll use this to contact you about the conference`}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="school" className="text-sm font-medium">
                School <span className="text-destructive">*</span>
              </label>
              <Input
                id="school"
                type="text"
                placeholder="Your school name"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                required
                disabled={isPending}
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isPending}
            >
              {isPending ? "Completing..." : "Complete Profile"}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>
              By continuing, you agree to our terms and conditions
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Contact us at{" "}
            <a href="mailto:support@fpa.org.fj" className="text-primary hover:underline">
              support@fpa.org.fj
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

