"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export interface AuditLog {
  id: string;
  action: string;
  description: string;
  timestamp: string;
}

export function RecentActivity({ logs }: { logs: AuditLog[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {logs.map((entry, index) => (
          <div key={entry.id} className="flex items-start gap-3 rounded-2xl border border-border/70 px-4 py-3">
            <div className="mt-1 rounded-full bg-accent/10 p-2 text-accent">
              {index % 2 === 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{entry.action}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{entry.description}</div>
              <div className="mt-1 text-xs text-slate-400">{new Date(entry.timestamp).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
