import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { CheckStatus, ComplianceStatus, Severity, ViolationStatus } from "@/types";

const badge = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap",
  {
    variants: {
      tone: {
        pass: "bg-success/10 text-success",
        fail: "bg-danger/10 text-danger",
        warn: "bg-warning/15 text-warning",
        neutral: "bg-muted text-muted-foreground",
        info: "bg-primary-soft text-primary",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

type Tone = NonNullable<VariantProps<typeof badge>["tone"]>;

const checkMap: Record<CheckStatus, { label: string; tone: Tone }> = {
  pass: { label: "Pass", tone: "pass" },
  fail: { label: "Fail", tone: "fail" },
  warning: { label: "Warning", tone: "warn" },
  not_detected: { label: "Not detected", tone: "neutral" },
  manual_review: { label: "Manual review", tone: "info" },
};

const complianceMap: Record<ComplianceStatus, { label: string; tone: Tone }> = {
  compliant: { label: "Compliant", tone: "pass" },
  non_compliant: { label: "Non-compliant", tone: "fail" },
  pending: { label: "Pending", tone: "neutral" },
  manual_review: { label: "Manual review", tone: "warn" },
};

const severityMap: Record<Severity, { label: string; tone: Tone }> = {
  critical: { label: "Critical", tone: "fail" },
  major: { label: "Major", tone: "warn" },
  minor: { label: "Minor", tone: "info" },
};

const violationMap: Record<ViolationStatus, { label: string; tone: Tone }> = {
  open: { label: "Open", tone: "fail" },
  acknowledged: { label: "Acknowledged", tone: "warn" },
  resolved: { label: "Resolved", tone: "pass" },
  dismissed: { label: "Dismissed", tone: "neutral" },
};

export function CheckBadge({ status, className }: { status: CheckStatus; className?: string }) {
  const { label, tone } = checkMap[status];
  return <span className={cn(badge({ tone }), className)}>{label}</span>;
}

export function ComplianceBadge({
  status,
  className,
}: {
  status: ComplianceStatus;
  className?: string;
}) {
  const { label, tone } = complianceMap[status];
  return <span className={cn(badge({ tone }), className)}>{label}</span>;
}

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const { label, tone } = severityMap[severity];
  return <span className={cn(badge({ tone }), className)}>{label}</span>;
}

export function ViolationStatusBadge({
  status,
  className,
}: {
  status: ViolationStatus;
  className?: string;
}) {
  const { label, tone } = violationMap[status];
  return <span className={cn(badge({ tone }), className)}>{label}</span>;
}
