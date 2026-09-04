import { ImagePlus, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ImageKind, ProductImage } from "@/types";

const KINDS: { kind: ImageKind; label: string }[] = [
  { kind: "front", label: "Front" },
  { kind: "back", label: "Back" },
  { kind: "side", label: "Side" },
  { kind: "label", label: "Label" },
  { kind: "mrp", label: "MRP area" },
  { kind: "other", label: "Other evidence" },
];

const MAX_MB = 8;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

function validate(file: File): string | null {
  if (!ACCEPTED.includes(file.type)) return "Only JPG, PNG or WebP images are accepted.";
  if (file.size > MAX_MB * 1024 * 1024) return `Image must be under ${MAX_MB} MB.`;
  return null;
}

export function ImageUploader({
  images,
  onChange,
}: {
  images: ProductImage[];
  onChange: (next: ProductImage[]) => void;
}) {
  const [kind, setKind] = useState<ImageKind>("front");
  const [dragging, setDragging] = useState(false);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const accepted: ProductImage[] = [];
    Array.from(files).forEach((file) => {
      const error = validate(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        return;
      }
      accepted.push({
        id: `img-${Math.random().toString(36).slice(2, 9)}`,
        kind,
        label: KINDS.find((k) => k.kind === kind)?.label ?? "Image",
        url: URL.createObjectURL(file),
        fileName: file.name,
        sizeKb: Math.round(file.size / 1024),
        uploadedAt: new Date().toISOString(),
        progress: 100,
        status: "uploaded",
      });
    });
    if (!accepted.length) return;

    if (replacingId) {
      onChange(images.map((img) => (img.id === replacingId ? accepted[0] : img)));
      setReplacingId(null);
      toast.success("Image replaced");
      return;
    }
    onChange([...images, ...accepted]);
    toast.success(`${accepted.length} image${accepted.length > 1 ? "s" : ""} added`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k.kind}
            type="button"
            onClick={() => setKind(k.kind)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-medium",
              kind === k.kind
                ? "border-primary bg-primary-soft text-primary"
                : "border-border bg-surface text-muted-foreground hover:bg-muted",
            )}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center",
          dragging ? "border-primary bg-primary-soft" : "border-border bg-muted/40",
        )}
      >
        <UploadCloud className="size-6 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">
          Drag and drop the <span className="text-primary">{KINDS.find((k) => k.kind === kind)?.label}</span> image
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          JPG, PNG or WebP · up to {MAX_MB} MB per image
        </p>
        <Button type="button" variant="outline" className="mt-4" onClick={() => inputRef.current?.click()}>
          <ImagePlus className="mr-2 size-4" /> Choose files
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          multiple={!replacingId}
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground">No images added yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {images.map((img) => (
            <figure key={img.id} className="panel overflow-hidden">
              <div className="aspect-4/3 bg-muted">
                <img
                  src={img.url}
                  alt={`${img.label} — ${img.fileName}`}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
              <figcaption className="space-y-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-semibold">{img.label}</span>
                  <span className="text-[11px] text-muted-foreground">{img.sizeKb} KB</span>
                </div>
                <p className="truncate text-[11px] text-muted-foreground">{img.fileName}</p>
                <div className="h-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-success" style={{ width: `${img.progress}%` }} />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                    onClick={() => {
                      setReplacingId(img.id);
                      inputRef.current?.click();
                    }}
                  >
                    <RefreshCw className="size-3" /> Replace
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[11px] text-danger hover:underline"
                    onClick={() => onChange(images.filter((i) => i.id !== img.id))}
                  >
                    <Trash2 className="size-3" /> Remove
                  </button>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
