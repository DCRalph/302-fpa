import { Button } from "~/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export default function EditDetails() {
  return (
    <Button variant="outline" className="gap-2" asChild>
      <Link href="/admin-dashboard/manage-conferences">
        <ExternalLink className="h-4 w-4" />
        Manage Conferences
      </Link>
    </Button>
  );
}