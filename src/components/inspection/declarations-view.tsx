import { Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CheckBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Declaration } from "@/types";

function confidenceTone(confidence: number) {
  if (confidence >= 0.9) return "bg-success";
  if (confidence >= 0.7) return "bg-warning";
  return "bg-danger";
}

export function DeclarationsView({
  declarations,
  onEdit,
}: {
  declarations: Declaration[];
  onEdit?: (id: string, value: string) => void;
}) {
  const [editing, setEditing] = useState<Declaration | null>(null);
  const [draft, setDraft] = useState("");

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {declarations.map((d) => (
          <article key={d.id} className="panel p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="label-caps">{d.label}</div>
                <p className="mt-1 text-sm font-semibold">
                  {d.extractedValue ?? <span className="text-muted-foreground">Not detected</span>}
                </p>
              </div>
              <CheckBadge status={d.status} />
            </div>

            <div className="mt-3">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Confidence</span>
                <span>{Math.round(d.confidence * 100)}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${confidenceTone(d.confidence)}`}
                  style={{ width: `${Math.max(d.confidence * 100, 2)}%` }}
                />
              </div>
            </div>

            <p className="mt-3 text-[11px] text-muted-foreground">
              Source: {d.sourceImageLabel ?? "—"}
            </p>
            {d.note && <p className="mt-1 text-[11px] text-muted-foreground">{d.note}</p>}

            <button
              type="button"
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
              onClick={() => {
                setEditing(d);
                setDraft(d.extractedValue ?? "");
              }}
            >
              <Pencil className="size-3" /> Edit value
            </button>
          </article>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Correct declaration</DialogTitle>
            <DialogDescription>
              Inspector corrections are recorded against {editing?.label.toLowerCase()} and marked as
              manually verified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="declaration-value">Value</Label>
            <Input
              id="declaration-value"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Enter the value read on the package"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editing) onEdit?.(editing.id, draft);
                setEditing(null);
                toast.success("Declaration updated");
              }}
            >
              Save correction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
