import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell, Disclaimer, PageHeader, Panel, StatCard } from "@/components/app-shell";
import { ComplianceBadge, SeverityBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import * as api from "@/services/api";
import { MOCK_DISCLAIMER } from "@/services/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Compliance Dashboard — LegalMetriCheck" },
      {
        name: "description",
        content:
          "Inspection totals, compliance rate, violation categories and recent packaged commodity inspections at a glance.",
      },
      { property: "og:title", content: "Compliance Dashboard — LegalMetriCheck" },
      {
        property: "og:description",
        content:
          "Inspection totals, compliance rate, violation categories and recent packaged commodity inspections at a glance.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const stats = useQuery({ queryKey: ["dashboard-stats"], queryFn: api.getDashboardStats });
  const recent = useQuery({
    queryKey: ["recent-inspections"],
    queryFn: () => api.getRecentInspections(5),
  });
  const s = stats.data;

  return (
    <AppShell contextLabel="Zone 4" contextValue="Enforcement console" contextMeta="Live session">
      <PageHeader
        title="Compliance Dashboard"
        subtitle="Packaged Commodities Rules, 2011 · declaration verification"
        actions={
          <>
            <Link
              to="/reports/$reportId"
              params={{ reportId: "ins-8842" }}
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm hover:bg-muted"
            >
              Report preview
            </Link>
            <Link
              to="/inspections/new"
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              New inspection
            </Link>
          </>
        }
      />

      <div className="space-y-4">
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.isLoading || !s ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)
          ) : (
            <>
              <StatCard
                label="Total inspections"
                value={s.totalInspections.toLocaleString()}
                hint={`${s.productsScanned.toLocaleString()} products scanned`}
              />
              <StatCard
                label="Compliant"
                value={s.compliant.toLocaleString()}
                tone="success"
                hint={`${((s.compliant / s.totalInspections) * 100).toFixed(1)}% of total`}
              />
              <StatCard
                label="Non-compliant"
                value={s.nonCompliant.toLocaleString()}
                tone="danger"
                hint={`${s.pending} inspections pending`}
              />
              <StatCard
                label="Compliance rate"
                value={`${s.compliancePercentage}%`}
                progress={s.compliancePercentage}
              />
            </>
          )}
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel
            title="Monthly inspection trend"
            meta="Mar – Aug 2026"
            className="lg:col-span-2"
            bodyClassName="p-4 pt-2"
          >
            <div className="h-56">
              {s && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={s.monthlyTrend} margin={{ top: 16, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--color-border)" />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid var(--color-border)",
                        fontSize: 12,
                        background: "var(--color-surface)",
                      }}
                    />
                    <Bar dataKey="inspections" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="violations" fill="var(--color-chart-5)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Panel>

          <Panel title="Violation categories">
            <div className="space-y-3 text-sm">
              {s?.violationCategories.map((c, i) => {
                const max = s.violationCategories[0].count;
                const tone = ["bg-danger", "bg-warning", "bg-primary", "bg-primary/60"][i] ?? "bg-primary";
                return (
                  <div key={c.category}>
                    <div className="mb-1 flex justify-between">
                      <span>{c.category}</span>
                      <span className="text-muted-foreground">{c.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${tone}`}
                        style={{ width: `${(c.count / max) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 border-t border-border pt-4">
              <div className="label-caps mb-2">Severity mix</div>
              <div className="flex flex-wrap gap-2">
                {s?.severityBreakdown.map((b) => (
                  <div key={b.severity} className="flex items-center gap-2">
                    <SeverityBadge severity={b.severity} />
                    <span className="text-sm text-muted-foreground">{b.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </section>

        <Panel
          title="Recent inspections"
          meta={
            <Link to="/inspections" className="text-primary hover:underline">
              View all
            </Link>
          }
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] tracking-wider text-muted-foreground uppercase">
                  <th className="px-4 py-2 font-medium">ID</th>
                  <th className="px-4 py-2 font-medium">Product</th>
                  <th className="px-4 py-2 font-medium">Manufacturer</th>
                  <th className="px-4 py-2 font-medium">Inspector</th>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Score</th>
                  <th className="px-4 py-2 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent.data?.map((i) => (
                  <tr key={i.id} className="hover:bg-muted/50">
                    <td className="px-4 py-2.5 font-medium">
                      <Link
                        to="/inspections/$inspectionId"
                        params={{ inspectionId: i.id }}
                        className="hover:underline"
                      >
                        {i.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">{i.productName}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{i.manufacturer}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{i.inspectorName}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{i.createdAt}</td>
                    <td className="px-4 py-2.5 font-semibold">{i.score || "—"}</td>
                    <td className="px-4 py-2.5 text-right">
                      <ComplianceBadge status={i.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Disclaimer text={MOCK_DISCLAIMER} />
      </div>
    </AppShell>
  );
}
