"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";
import { Spinner } from "~/components/ui/spinner";
import { toast } from "sonner";
import { CheckCircle, XCircle, Calendar, DollarSign, User, Mail, Phone, Building2, Briefcase, GraduationCap, Award, FileText, Download } from "lucide-react";
import Image from "next/image";

interface RegistrationDetailsDialogProps {
  registrationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegistrationDetailsDialog({
  registrationId,
  open,
  onOpenChange,
}: RegistrationDetailsDialogProps) {
  const [approvalNote, setApprovalNote] = useState("");
  const [denialReason, setDenialReason] = useState("");
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showDenialForm, setShowDenialForm] = useState(false);

  const { data: registration, isLoading } = api.admin.registrations.getById.useQuery(
    { id: registrationId },
    { enabled: !!registrationId && open }
  );

  const utils = api.useUtils();

  const approveMutation = api.admin.registrations.approve.useMutation({
    onSuccess: async () => {
      toast.success("Registration approved successfully");
      await utils.admin.registrations.getByConferenceId.invalidate();
      await utils.admin.registrations.getById.invalidate({ id: registrationId });
      setApprovalNote("");
      setShowApprovalForm(false);
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to approve registration");
    },
  });

  const denyMutation = api.admin.registrations.deny.useMutation({
    onSuccess: async () => {
      toast.success("Registration denied");
      await utils.admin.registrations.getByConferenceId.invalidate();
      await utils.admin.registrations.getById.invalidate({ id: registrationId });
      setDenialReason("");
      setShowDenialForm(false);
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to deny registration");
    },
  });

  const handleApprove = () => {
    approveMutation.mutate({
      id: registrationId,
      note: approvalNote || undefined,
    });
  };

  const handleDeny = () => {
    if (!denialReason.trim()) {
      toast.error("Please provide a reason for denial");
      return;
    }
    denyMutation.mutate({
      id: registrationId,
      reason: denialReason,
    });
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Spinner className="size-10" />
          </div>
        </DialogContent>
      </Dialog >
    );
  }

  if (!registration) {
    return null;
  }

  const totalPaid = registration.payments
    .filter((p) => p.status === "succeeded")
    .reduce((sum, p) => sum + p.amountCents, 0);
  const expectedAmount = registration.priceCents ?? registration.conference?.priceCents ?? 0;
  const amountDue = Math.max(expectedAmount - totalPaid, 0);

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

  const isPending = registration.status === "pending";
  const isConfirmed = registration.status === "confirmed";
  const isCancelled = registration.status === "cancelled";

  // Parse metadata
  const metadata = registration.metadata as {
    paymentMethod?: string;
    dietary?: {
      day1?: string;
      day2Conference?: string;
      day2Closing?: string;
    };
    remits?: string[];
  } | null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Registration Details
            <Badge variant={getStatusBadgeVariant(registration.status)}>
              {registration.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Submitted on {new Date(registration.createdAt).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Participant Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Participant Information</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <User className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-muted-foreground text-xs">Name</p>
                  <p className="font-medium">{registration.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-muted-foreground text-xs">Email</p>
                  <p className="font-medium">{registration.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-muted-foreground text-xs">Phone</p>
                  <p className="font-medium">{registration.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-muted-foreground text-xs">School</p>
                  <p className="font-medium">{registration.school}</p>
                </div>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-xs">Position</p>
                <p className="font-medium">{registration.position}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Experience</p>
                <p className="font-medium">{registration.experience || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Professional Profile Information */}
          <Separator />
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Professional Profile</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Briefcase className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-muted-foreground text-xs">Position</p>
                  <p className="font-medium">
                    {registration.user?.professionalPosition && registration.user.professionalPosition.trim() !== "" ? (
                      registration.user.professionalPosition
                    ) : (
                      <span className="text-muted-foreground italic">No info provided</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-muted-foreground text-xs">Years of Experience</p>
                  <p className="font-medium">
                    {registration.user?.professionalYears && registration.user.professionalYears > 0 ? (
                      `${registration.user.professionalYears} years`
                    ) : (
                      <span className="text-muted-foreground italic">No info provided</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-muted-foreground text-xs">Qualification</p>
                  <p className="font-medium">
                    {registration.user?.professionalQualification && registration.user.professionalQualification.trim() !== "" ? (
                      registration.user.professionalQualification
                    ) : (
                      <span className="text-muted-foreground italic">No info provided</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-muted-foreground text-xs">Specialisation</p>
                  <p className="font-medium">
                    {registration.user?.professionalSpecialisation && registration.user.professionalSpecialisation.trim() !== "" ? (
                      registration.user.professionalSpecialisation
                    ) : (
                      <span className="text-muted-foreground italic">No info provided</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-2">Professional Bio</p>
              <div className="rounded-md border bg-muted/50 p-3">
                <p className="text-sm whitespace-pre-wrap">
                  {registration.user?.professionalBio && registration.user.professionalBio.trim() !== "" ? (
                    registration.user.professionalBio
                  ) : (
                    <span className="text-muted-foreground italic">No info provided</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Conference & Payment Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Conference & Payment</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Calendar className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-muted-foreground text-xs">Conference</p>
                  <p className="font-medium">{registration.conference?.name ?? "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-muted-foreground text-xs">Registration Fee</p>
                  <p className="font-medium">
                    {registration.conference?.currency ?? "FJD"} $
                    {((expectedAmount) / 100).toFixed(2)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Amount Paid</p>
                <p className="font-medium text-green-600">
                  {registration.conference?.currency ?? "FJD"} ${(totalPaid / 100).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Amount Due</p>
                <p className={`font-medium ${amountDue > 0 ? "text-red-600" : "text-green-600"}`}>
                  {registration.conference?.currency ?? "FJD"} ${(amountDue / 100).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-xs">Payment Status</p>
                <Badge variant={registration.paymentStatus === "paid" ? "default" : "destructive"}>
                  {registration.paymentStatus}
                </Badge>
              </div>
              {metadata?.paymentMethod && (
                <div>
                  <p className="text-muted-foreground text-xs">Payment Method</p>
                  <p className="font-medium capitalize">{metadata.paymentMethod}</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          {(metadata?.dietary ?? metadata?.remits?.length) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Additional Information</h3>

                {metadata?.dietary && (
                  <div>
                    <p className="text-muted-foreground mb-2 text-sm">Dietary Preferences</p>
                    <div className="grid gap-2 md:grid-cols-3 text-sm">
                      {metadata.dietary.day1 && (
                        <div>
                          <span className="font-medium">Day 1:</span> {metadata.dietary.day1}
                        </div>
                      )}
                      {metadata.dietary.day2Conference && (
                        <div>
                          <span className="font-medium">Day 2 Conference:</span>{" "}
                          {metadata.dietary.day2Conference}
                        </div>
                      )}
                      {metadata.dietary.day2Closing && (
                        <div>
                          <span className="font-medium">Day 2 Closing:</span>{" "}
                          {metadata.dietary.day2Closing}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {metadata?.remits && metadata.remits.length > 0 && (
                  <div>
                    <p className="text-muted-foreground mb-2 text-sm">Remits</p>
                    <div className="space-y-2">
                      {metadata.remits.map((remit, index) => (
                        <div key={index} className="text-sm border-l-2 border-muted pl-3">
                          <span className="font-medium">Remit {index + 1}:</span> {remit}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Supporting Documents */}
          {registration.attachments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">
                  Supporting Documents ({registration.attachments.length})
                </h3>
                <div className="space-y-4">
                  {registration.attachments.map((attachment) => (
                    <div key={attachment.id} className="rounded-lg border bg-muted/50 p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium">{attachment.filename}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              {attachment.mimeType && (
                                <span className="capitalize">
                                  {attachment.mimeType.split('/')[1]} file
                                </span>
                              )}
                            </span>
                            <span>
                              {Math.round(attachment.sizeBytes / 1024)} KB
                            </span>
                            <span>
                              Uploaded {new Date(attachment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Download the file
                            window.open(`/api/files/${attachment.id}/download`, '_blank');
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>

                      {/* File Preview for Images */}
                      {attachment.mimeType?.startsWith('image/') && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                          <div className="rounded-md border bg-white p-2 max-w-md">
                            <Image
                              src={`/api/files/${attachment.id}/download`}
                              alt={attachment.filename}
                              width={400}
                              height={300}
                              className="max-w-full h-auto rounded object-contain"
                              style={{ maxHeight: '300px' }}
                              unoptimized
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Status History */}
          {registration.statusHistory.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Status History</h3>
                <div className="space-y-2 text-sm">
                  {registration.statusHistory.map((history) => (
                    <div key={history.id} className="border-l-2 border-muted pl-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {history.previousStatus} → {history.newStatus}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          {new Date(history.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {history.reason && (
                        <p className="text-muted-foreground mt-1">{history.reason}</p>
                      )}
                      {history.changedBy && (
                        <p className="text-muted-foreground text-xs">
                          by {history.changedBy.name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-4">
            {isPending && !showApprovalForm && !showDenialForm && (
              <div className="flex gap-2">
                <Button
                  className="flex-1 gap-2"
                  onClick={() => setShowApprovalForm(true)}
                  disabled={approveMutation.isPending || denyMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve Registration
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
                  onClick={() => setShowDenialForm(true)}
                  disabled={approveMutation.isPending || denyMutation.isPending}
                >
                  <XCircle className="h-4 w-4" />
                  Deny Registration
                </Button>
              </div>
            )}

            {showApprovalForm && (
              <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                <Label htmlFor="approval-note">Approval Note (Optional)</Label>
                <Textarea
                  id="approval-note"
                  placeholder="Add a note about this approval..."
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleApprove}
                    disabled={approveMutation.isPending}
                    className="flex-1"
                  >
                    {approveMutation.isPending ? "Approving..." : "Confirm Approval"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowApprovalForm(false);
                      setApprovalNote("");
                    }}
                    disabled={approveMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
                <p className="text-muted-foreground text-xs">
                  This will set the registration status to <strong>confirmed</strong> with payment
                  status <strong>unpaid</strong>.
                </p>
              </div>
            )}

            {showDenialForm && (
              <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
                <Label htmlFor="denial-reason">
                  Reason for Denial <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="denial-reason"
                  placeholder="Please provide a reason for denying this registration..."
                  value={denialReason}
                  onChange={(e) => setDenialReason(e.target.value)}
                  rows={3}
                  required
                />
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleDeny}
                    disabled={denyMutation.isPending || !denialReason.trim()}
                    className="flex-1"
                  >
                    {denyMutation.isPending ? "Denying..." : "Confirm Denial"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDenialForm(false);
                      setDenialReason("");
                    }}
                    disabled={denyMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {isConfirmed && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-900 dark:bg-green-950">
                <CheckCircle className="text-green-600 dark:text-green-400 mx-auto mb-2 h-8 w-8" />
                <p className="font-semibold text-green-900 dark:text-green-100">
                  Registration Approved
                </p>
                <p className="text-muted-foreground text-sm">
                  This registration has been confirmed with payment status: {registration.paymentStatus}
                </p>
              </div>
            )}

            {isCancelled && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:border-red-900 dark:bg-red-950">
                <XCircle className="text-red-600 dark:text-red-400 mx-auto mb-2 h-8 w-8" />
                <p className="font-semibold text-red-900 dark:text-red-100">
                  Registration Cancelled
                </p>
                <p className="text-muted-foreground text-sm">
                  This registration has been denied/cancelled
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

