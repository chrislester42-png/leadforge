"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Trash2, RotateCcw, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface OrderActionsProps {
  jobId: string;
  status: string;
}

export function OrderActions({ jobId, status }: OrderActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this job and all its leads? This cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/scrape/${jobId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/orders");
      router.refresh();
    } else {
      setDeleting(false);
      alert("Failed to delete job. Please try again.");
    }
  }

  function handleCopyId() {
    navigator.clipboard.writeText(jobId);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal size={16} />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopyId}>
          <Copy size={14} /> Copy Job ID
        </DropdownMenuItem>
        {status === "failed" && (
          <DropdownMenuItem onClick={() => router.push("/scrape")}>
            <RotateCcw size={14} /> Retry scrape
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 size={14} /> {deleting ? "Deleting..." : "Delete job"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
