"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import { Spinner } from "~/components/ui/spinner";
import { ArrowLeft, Eye, FileText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { RegistrationDetailsDialog } from "./RegistrationDetailsDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "sonner";

export default function ConferenceRegistrationsPage() {
  const params = useParams();
  const conferenceId = params.id as string;

  const { data: registrations, isLoading } = api.admin.registrations.getByConferenceId.useQuery(
    { conferenceId },
    { enabled: !!conferenceId }
  );

  const { data: conference } = api.admin.conference.getById.useQuery(
    { id: conferenceId },
    { enabled: !!conferenceId }
  );

  const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [edited, setEdited] = useState<Record<string, { status: "pending" | "confirmed" | "cancelled"; paymentStatus: "unpaid" | "pending" | "paid" | "refunded" | "partial" }>>({});

  const utils = api.useUtils();
  const updateStatusMutation = api.admin.registrations.updateStatus.useMutation({
    // Optimistic update
    onMutate: async (input) => {
      await utils.admin.registrations.getByConferenceId.cancel({ conferenceId });
      const previous = utils.admin.registrations.getByConferenceId.getData({ conferenceId });

      utils.admin.registrations.getByConferenceId.setData({ conferenceId }, (old) => {
        if (!old) return old;
        return old.map((r) =>
          r.id === input.id
            ? {
              ...r,
              status: input.status,
              paymentStatus: input.paymentStatus ?? r.paymentStatus,
            }
            : r,
        );
      });

      return { previous };
    },
    onError: (err, _input, context) => {
      if (context?.previous) {
        utils.admin.registrations.getByConferenceId.setData({ conferenceId }, context.previous);
      }
      toast.error(err.message ?? "Failed to update registration");
    },
    onSuccess: async (_data, variables) => {
      toast.success("Registration updated");
      // Clear edited state for the saved row
      setEdited((prev) => {
        const next = { ...prev };
        delete next[variables.id];
        return next;
      });
      setSavingId(null);
    },
    onSettled: async () => {
      await utils.admin.registrations.getByConferenceId.invalidate({ conferenceId });
      setSavingId(null);
    },
  });

  const handleViewDetails = (registrationId: string) => {
    setSelectedRegistrationId(registrationId);
    setDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "unpaid":
        return "destructive";
      case "pending":
        return "secondary";
      case "partial":
        return "secondary";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner className="size-10" />
      </div>
    );
  }

  return (
    <main className="flex-1 p-3 sm:p-4 md:p-6">
      <div className="mb-6">
        <Link href={`/admin-dashboard/manage-conferences/${conferenceId}`}>
          <Button variant="ghost" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Conference
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Conference Registrations</h1>
            {conference && (
              <p className="text-muted-foreground mt-1">
                {conference.name} - {registrations?.length ?? 0} registrations
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Registrations List */}
      {!registrations || registrations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="mb-2 text-xl font-semibold">No registrations yet</h3>
            <p className="text-muted-foreground">
              Registrations will appear here when people register for this conference.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Registrations ({registrations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {registrations.map((registration) => {
                const totalPaid = registration.payments
                  .filter((p) => p.status === "succeeded")
                  .reduce((sum, p) => sum + p.amountCents, 0);
                const expectedAmount = registration.priceCents ?? registration.conference?.priceCents ?? 0;
                const amountDue = Math.max(expectedAmount - totalPaid, 0);

                const editedValues = edited[registration.id] ?? {
                  status: registration.status as "pending" | "confirmed" | "cancelled",
                  paymentStatus: registration.paymentStatus as "unpaid" | "pending" | "paid" | "refunded" | "partial",
                };
                const isDirty =
                  editedValues.status !== (registration.status as "pending" | "confirmed" | "cancelled") ||
                  editedValues.paymentStatus !== (registration.paymentStatus as "unpaid" | "pending" | "paid" | "refunded" | "partial");

                return (
                  <Card key={registration.id} className="border-muted">
                    <CardContent>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{registration.name}</h3>
                                <Badge variant={getStatusBadgeVariant(registration.status)}>
                                  {registration.status}
                                </Badge>
                                <Badge variant={getPaymentStatusBadgeVariant(registration.paymentStatus)}>
                                  {registration.paymentStatus}
                                </Badge>
                                {registration.attachments && registration.attachments.length > 0 && (
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    {registration.attachments.length} Document{registration.attachments.length > 1 ? 's' : ''}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-muted-foreground mt-1 space-y-1 text-sm">
                                <p>
                                  <strong>Email:</strong> {registration.email}
                                </p>
                                <p>
                                  <strong>Phone:</strong> {registration.phone}
                                </p>
                                <p>
                                  <strong>School:</strong> {registration.school}
                                </p>
                                <p>
                                  <strong>Position:</strong> {registration.position}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Registered:</span>{" "}
                              <span className="font-medium">
                                {new Date(registration.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Amount Paid:</span>{" "}
                              <span className="font-medium">
                                {registration.conference?.currency ?? "FJD"} $
                                {(totalPaid / 100).toFixed(2)}
                              </span>
                            </div>
                            {amountDue > 0 && (
                              <div>
                                <span className="text-muted-foreground">Amount Due:</span>{" "}
                                <span className="font-medium text-destructive">
                                  {registration.conference?.currency ?? "FJD"} $
                                  {(amountDue / 100).toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 pt-1">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground text-xs">Status</span>
                              <Select
                                value={editedValues.status}
                                disabled={savingId === registration.id && updateStatusMutation.isPending}
                                onValueChange={(value) => {
                                  setEdited((prev) => ({
                                    ...prev,
                                    [registration.id]: {
                                      ...editedValues,
                                      status: value as "pending" | "confirmed" | "cancelled",
                                    },
                                  }));
                                }}
                              >
                                <SelectTrigger size="sm" aria-label="Change registration status">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">pending</SelectItem>
                                  <SelectItem value="confirmed">confirmed</SelectItem>
                                  <SelectItem value="cancelled">cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground text-xs">Payment</span>
                              <Select
                                value={editedValues.paymentStatus}
                                disabled={savingId === registration.id && updateStatusMutation.isPending}
                                onValueChange={(value) => {
                                  setEdited((prev) => ({
                                    ...prev,
                                    [registration.id]: {
                                      ...editedValues,
                                      paymentStatus: value as
                                        | "unpaid"
                                        | "pending"
                                        | "paid"
                                        | "refunded"
                                        | "partial",
                                    },
                                  }));
                                }}
                              >
                                <SelectTrigger size="sm" aria-label="Change payment status">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="unpaid">unpaid</SelectItem>
                                  <SelectItem value="pending">pending</SelectItem>
                                  <SelectItem value="paid">paid</SelectItem>
                                  <SelectItem value="partial">partial</SelectItem>
                                  <SelectItem value="refunded">refunded</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {savingId === registration.id && updateStatusMutation.isPending && (
                              <span className="text-muted-foreground text-xs">Saving…</span>
                            )}
                          </div>

                          {/* Row-level Save/Cancel controls */}
                          {isDirty && (
                            <div className="flex items-center gap-2 pt-1">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSavingId(registration.id);
                                  updateStatusMutation.mutate({
                                    id: registration.id,
                                    status: editedValues.status,
                                    paymentStatus: editedValues.paymentStatus,
                                  });
                                }}
                                disabled={savingId === registration.id && updateStatusMutation.isPending}
                              >
                                {savingId === registration.id && updateStatusMutation.isPending ? "Saving…" : "Save"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEdited((prev) => {
                                    const next = { ...prev };
                                    delete next[registration.id];
                                    return next;
                                  });
                                }}
                                disabled={savingId === registration.id && updateStatusMutation.isPending}
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleViewDetails(registration.id)}
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Registration Details Dialog */}
      {selectedRegistrationId && (
        <RegistrationDetailsDialog
          registrationId={selectedRegistrationId}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </main>
  );
}

