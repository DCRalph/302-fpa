"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Spinner } from "~/components/ui/spinner";
import { api } from "~/trpc/react";
import { CreditCard, Building2, Hash, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "~/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";

export default function PaymentDetails() {
  const { data: conference, isLoading: conferenceLoading } =
    api.member.registration.getLatestConference.useQuery();

  const { data: registration, isLoading: registrationLoading } =
    api.member.registration.getMyLatest.useQuery();

  if (conferenceLoading || registrationLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!conference) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No active conference found.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate payment status
  const isPartial = registration?.paymentStatus === "partial";
  const isPending = registration?.paymentStatus === "pending";

  // Calculate total paid amount
  const totalPaid = registration?.payments
    ?.filter((p) => p.status === "succeeded")
    .reduce((sum, p) => sum + p.amountCents, 0) ?? 0;
  const totalRefunded = registration?.payments
    ?.filter((p) => p.status === "refunded")
    .reduce((sum, p) => sum + p.amountCents, 0) ?? 0;
  const netPaid = totalPaid - totalRefunded;
  const registrationFee = conference.priceCents;
  const amountDue = Math.max(registrationFee - netPaid, 0);
  const isFullyPaid = registration ? (netPaid >= registrationFee && registrationFee > 0) : false;

  return (
    <div className="flex-1 space-y-6 p-3 sm:p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Payment Details</h1>
        <p className="text-muted-foreground mt-2">
          Bank transfer information for conference registration payment
        </p>
      </div>

      {/* Payment Status Alert */}
      {registration && (
        <div className="mx-auto max-w-2xl">
          {isFullyPaid ? (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-900 dark:text-green-100 font-bold text-lg">
                Payment Complete ✓
              </AlertTitle>
              <AlertDescription className="text-green-800 dark:text-green-200 mt-2">
                <div className="space-y-2">
                  <p className="font-semibold">
                    Your payment has been successfully processed. You do not need to make any additional payments.
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="default" className="bg-green-600 text-white">
                      Paid: {conference.currency} ${(netPaid / 100).toFixed(2)}
                    </Badge>
                    <Badge variant="outline" className="border-green-600 text-green-800 dark:text-green-200">
                      Status: {registration.paymentStatus.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ) : isPartial ? (
            <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <AlertTitle className="text-yellow-900 dark:text-yellow-100 font-bold text-lg">
                Partial Payment Received
              </AlertTitle>
              <AlertDescription className="text-yellow-800 dark:text-yellow-200 mt-2">
                <div className="space-y-2">
                  <p>
                    We have received a partial payment. Please complete the remaining balance.
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="border-yellow-600 text-yellow-800 dark:text-yellow-200">
                      Paid: {conference.currency} ${(netPaid / 100).toFixed(2)}
                    </Badge>
                    <Badge variant="outline" className="border-red-600 text-red-800 dark:text-red-200">
                      Remaining: {conference.currency} ${(amountDue / 100).toFixed(2)}
                    </Badge>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ) : isPending ? (
            <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-900 dark:text-blue-100 font-bold text-lg">
                Payment Pending
              </AlertTitle>
              <AlertDescription className="text-blue-800 dark:text-blue-200 mt-2">
                <p>
                  Your payment is being processed. Please wait for confirmation before making another payment.
                </p>
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
      )}

      <Card className="mx-auto max-w-2xl border-primary/30 relative overflow-hidden border bg-gradient-to-br from-blue-50/70 to-purple-50/70 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md dark:from-blue-950/20 dark:to-purple-950/20">
        {/* Decorative glow elements */}
        <div
          className="from-primary/20 pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-br to-purple-500/20 blur-2xl"
          aria-hidden
        />
        <div
          className="from-primary/20 pointer-events-none absolute bottom-0 left-0 h-16 w-16 animate-pulse bg-gradient-to-tr to-transparent"
          aria-hidden
        />

        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 ring-primary/20 rounded-md p-2 ring-1">
              <CreditCard className="text-primary h-5 w-5" />
            </div>
            <CardTitle className="text-base font-bold tracking-tight">
              Bank Transfer Details
            </CardTitle>
          </div>
          <CardDescription className="mt-2">
            Payment information for registration
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <TooltipProvider>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="border-border/60 bg-background/50 rounded-lg border p-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div className="text-muted-foreground text-xs tracking-wide uppercase">
                        Registration Fee
                      </div>
                    </div>
                    <div className="font-semibold text-lg">
                      {conference
                        ? `${conference.currency} $${(conference.priceCents / 100).toFixed(2)}`
                        : "TBD"}
                    </div>
                    {registration && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Status: <span className="font-medium capitalize">{registration.paymentStatus}</span>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {conference
                    ? `${conference.currency} $${(conference.priceCents / 100).toFixed(2)}`
                    : "TBD"}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="border-border/60 bg-background/50 rounded-lg border p-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div className="text-muted-foreground text-xs tracking-wide uppercase">
                        Account Name
                      </div>
                    </div>
                    <div className="font-semibold break-words">
                      {conference?.bankTransferAccountName ?? "TBD"}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{conference?.bankTransferAccountName ?? "TBD"}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="border-border/60 bg-background/50 rounded-lg border p-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div className="text-muted-foreground text-xs tracking-wide uppercase">
                        Bank & Branch
                      </div>
                    </div>
                    <div className="font-semibold break-words">
                      {conference?.bankTransferBranch ?? "TBD"}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{conference?.bankTransferBranch ?? "TBD"}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="border-border/60 bg-background/50 rounded-lg border p-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <div className="text-muted-foreground text-xs tracking-wide uppercase">
                        Account Number
                      </div>
                    </div>
                    <div className="font-semibold break-words font-mono">
                      {conference?.bankTransferAccountNumber ?? "TBD"}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs font-mono">{conference?.bankTransferAccountNumber ?? "TBD"}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          {registration && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-3">Your Registration</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registration ID:</span>
                  <span className="font-mono font-medium">{registration.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{registration.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status:</span>
                  <span className="font-medium capitalize">{registration.paymentStatus}</span>
                </div>
                {registration.payments && registration.payments.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-muted-foreground text-xs mb-2">Payment History:</p>
                    {registration.payments.map((payment) => (
                      <div key={payment.id} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </span>
                        <span className="font-medium">
                          {payment.currency} ${(payment.amountCents / 100).toFixed(2)} - {payment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {!isFullyPaid && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Important:</strong> Please include your registration ID in the payment reference when making the bank transfer. This will help us process your payment faster.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

