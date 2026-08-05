"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { removeApplied } from "@/lib/db/applied";

export function RemoveAppliedButton({ opportunityId }: { opportunityId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await removeApplied(opportunityId);
          router.refresh();
        })
      }
    >
      <TrashIcon className="size-4" aria-hidden />
      Remove
    </Button>
  );
}
