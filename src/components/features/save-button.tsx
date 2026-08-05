"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookmarkSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { toggleSave } from "@/lib/db/saved";

interface SaveButtonProps {
  opportunityId: string;
  saved: boolean;
  showLabel?: boolean;
}

export function SaveButton({
  opportunityId,
  saved,
  showLabel = true,
}: SaveButtonProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onClick() {
    startTransition(async () => {
      await toggleSave(opportunityId);
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant={saved ? "default" : "outline"}
      size="sm"
      disabled={pending}
      onClick={onClick}
      aria-pressed={saved}
    >
      <BookmarkSimpleIcon
        className="size-4"
        weight={saved ? "fill" : "regular"}
        aria-hidden
      />
      {showLabel ? (saved ? "Saved" : "Save") : null}
    </Button>
  );
}
