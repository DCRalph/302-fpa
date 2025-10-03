"use client";
import { UserButton as StackUserButton } from "@stackframe/stack";
import { UserIcon } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";

export function UserButton() {
  const router = useRouter();
  return (
    <StackUserButton extraItems={[{ text: "Auth Status", icon: <UserIcon className="size-4" />, onClick: () => { router.push("/auth"); } }]} />
  );
}