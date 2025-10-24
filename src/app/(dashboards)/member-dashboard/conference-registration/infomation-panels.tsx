import type { ConferenceContact } from "@prisma/client";
import { Mail, Phone, School, UserRound } from "lucide-react";
import z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { Separator } from "~/components/ui/separator";
import { type RouterOutputs } from "~/trpc/react";
import Link from "next/link";

type Conference = RouterOutputs["member"]["registration"]["getLatestConference"]

export default function InformationPanels({ conference }: { conference: Conference }) {
    return (
        <TooltipProvider>
            {/* Right Column - Information Panels */}
            <div className="h-full sticky top-20">
                <div className="space-y-6 h-full sticky">
                    {/* Bank Transfer Details */}
                    <Card className="border-primary/30 relative overflow-hidden border bg-gradient-to-br from-blue-50/70 to-purple-50/70 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md dark:from-blue-950/20 dark:to-purple-950/20">
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
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="text-primary h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M12 2l9 4v6c0 5-9 10-9 10s-9-5-9-10V6l9-4z" />
                                    </svg>
                                </div>
                                <CardTitle className="text-base font-bold tracking-tight">
                                    Bank Transfer Details
                                </CardTitle>
                            </div>

                            <p className="text-muted-foreground mt-2 text-sm">
                                Payment information for registration
                            </p>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="border-border/60 bg-background/50 rounded-lg border p-3 cursor-pointer shadow-sm">
                                            <div className="text-muted-foreground mb-1 text-xs tracking-wide uppercase">
                                                Registration Fee
                                            </div>
                                            <div className="font-medium truncate">
                                                {conference
                                                    ? `${conference.currency} $${(conference.priceCents / 100).toFixed(2)}`
                                                    : "TBD"}
                                            </div>
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
                                        <div className="border-border/60 bg-background/50 rounded-lg border p-3 cursor-pointer shadow-sm">
                                            <div className="text-muted-foreground mb-1 text-xs tracking-wide uppercase">
                                                Account Name
                                            </div>
                                            <div className="font-medium truncate">
                                                {conference?.bankTransferAccountName ?? "TBD"}
                                            </div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {conference?.bankTransferAccountName ?? "TBD"}
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="border-border/60 bg-background/50 rounded-lg border p-3 cursor-pointer shadow-sm">
                                            <div className="text-muted-foreground mb-1 text-xs tracking-wide uppercase">
                                                Bank & Branch
                                            </div>
                                            <div className="font-medium truncate">
                                                {conference?.bankTransferBranch ?? "TBD"}
                                            </div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {conference?.bankTransferBranch ?? "TBD"}
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="border-border/60 bg-background/50 rounded-lg border p-3 cursor-pointer shadow-sm">
                                            <div className="text-muted-foreground mb-1 text-xs tracking-wide uppercase ">
                                                Account Number
                                            </div>
                                            <div className="font-medium truncate">
                                                {conference?.bankTransferAccountNumber ?? "TBD"}
                                            </div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {conference?.bankTransferAccountNumber ?? "TBD"}
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card className="border-primary/30 relative overflow-hidden border bg-gradient-to-br from-blue-50/70 to-purple-50/70 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md dark:from-blue-950/20 dark:to-purple-950/20">
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
                                    <Mail className="text-primary h-5 w-5" />
                                </div>
                                <CardTitle className="text-base font-bold tracking-tight">
                                    Contact Information
                                </CardTitle>
                            </div>
                            <p className="text-muted-foreground mt-2 text-sm">
                                Reach out for registration assistance
                            </p>
                        </CardHeader>

                        <CardContent className="space-y-5">
                            {conference?.contacts && conference.contacts.length > 0 ? (
                                <>
                                    {conference.contacts.map((contact, index: number) => (
                                        <RegistrationContactRow
                                            contact={contact}
                                            index={index}
                                            key={index}
                                        />
                                    ))}
                                </>
                            ) : (
                                <div className="text-center text-sm opacity-75">
                                    <p>Contact information not available at this time.</p>
                                    <p className="mt-2">
                                        Please email{" "}
                                        <Link
                                            target="_blank"
                                            href="mailto:fijiprincipalsassociation@gmail.com"
                                            className="text-blue-800 hover:underline dark:text-blue-400"
                                        >
                                            fijiprincipalsassociation@gmail.com
                                        </Link>
                                    </p>
                                </div>
                            )}

                            <Separator className="bg-border/60" />

                            {/* Always-visible fallback contact */}
                            <div className="border-border/60 bg-background/50 rounded-lg border p-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="text-primary h-4 w-4" />
                                    <span className="font-medium">Email:</span>
                                    <Link
                                        target="_blank"
                                        href="mailto:fijiprincipalsassociation@gmail.com"
                                        className="text-blue-800 hover:underline dark:text-blue-400 truncate"
                                    >
                                        fijiprincipalsassociation@gmail.com
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TooltipProvider>
    );
}


const fieldsSchema = z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    school: z.string().optional(),
});

function RegistrationContactRow({
    contact,
    index,
}: {
    contact: ConferenceContact;
    index: number;
}) {
    const { data: fields, success } = fieldsSchema.safeParse(contact.fields);

    if (!success) {
        return null;
    }

    return (
        <div key={contact.id || index}>
            {index > 0 && (
                <Separator
                    orientation="horizontal"
                    className="mb-4 bg-[#CCCCCC] dark:bg-white/60"
                />
            )}
            <div>
                <div className="flex items-center gap-2">
                    <UserRound className="text-primary h-4 w-4" />
                    <span className="font-semibold text-foreground">
                        {contact.name}
                    </span>
                </div>

                {fields.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <Link
                            href={`tel:${fields.phone}`}
                            className="hover:underline text-foreground/80"
                        >
                            {fields.phone}
                        </Link>
                    </div>
                )}
                {fields.school && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <School className="h-4 w-4" />
                        <span className="text-foreground/80">
                            {fields.school}
                        </span>
                    </div>
                )}
                {/* TODO: Replace with "Role", there is only one email */}
                {fields.email && (
                    <div className="text-sm">
                        <strong>Email:</strong>{" "}
                        <Link
                            target="_blank"
                            href={`mailto:${fields.email}`}
                            className="text-blue-800 hover:underline"
                        >
                            {fields.email}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}