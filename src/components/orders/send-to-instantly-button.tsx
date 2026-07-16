"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { SendToInstantlyDialog } from "./send-to-instantly-dialog";

export function SendToInstantlyButton({
  jobId,
  leadCount,
}: {
  jobId: string;
  leadCount: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="accent" onClick={() => setOpen(true)}>
        <Send size={14} className="mr-1.5" /> Send to Instantly
      </Button>
      <SendToInstantlyDialog
        jobId={jobId}
        leadCount={leadCount}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
