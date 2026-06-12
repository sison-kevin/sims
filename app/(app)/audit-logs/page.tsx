import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listAuditLogs } from "@/lib/store";
import { UserCircle2 } from "lucide-react";

export default async function AuditLogsPage() {
  const logs = (await listAuditLogs()).slice(0, 25);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Audit logs</h2>
        <p className="text-slate-500 dark:text-slate-400">Track who changed what and when across the operational surface.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity feed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {logs.map((log) => {
            const severity = log.action.includes("DELETED") ? "destructive" : log.action.includes("UPDATED") ? "secondary" : "outline";

            return (
              <div key={log.id} className="flex items-start gap-4 rounded-2xl border border-border/70 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <UserCircle2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-medium">{log.action}</div>
                    <Badge variant={severity}>{log.user_id}</Badge>
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{log.description}</div>
                  <div className="mt-1 text-xs text-slate-400">{new Date(log.timestamp).toLocaleString()}</div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}