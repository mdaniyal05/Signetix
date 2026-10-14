import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { ReportReason } from "@/api/reports";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REASONS: ReportReason[] = ["Harassment", "Spam", "Inappropriate Content"];

interface ReportDialogProps {
  open: boolean;
  name: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: ReportReason) => Promise<void>;
}

export function ReportDialog({ open, name, onOpenChange, onSubmit }: ReportDialogProps) {
  const [reason, setReason] = useState<ReportReason>("Harassment");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(reason);
      toast.success("Report submitted");
      onOpenChange(false);
    } catch (error) {
      toast.error("Could not submit report", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Report {name}</DialogTitle>
          <DialogDescription>
            Tell us what's wrong. Our team will review it.
          </DialogDescription>
        </DialogHeader>
        <Select value={reason} onValueChange={(value) => setReason(value as ReportReason)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REASONS.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="animate-spin" />}
            Submit report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
