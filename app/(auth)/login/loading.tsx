import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-full border border-border/70 bg-background/80 p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-44 rounded-full" />
            <Skeleton className="h-10 w-56 rounded-full" />
            <Skeleton className="h-10 w-48 rounded-full" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-[2rem]">
            <CardHeader className="space-y-5 p-8">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-14 w-[85%]" />
              <Skeleton className="h-6 w-[76%]" />
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <Skeleton className="h-[360px] w-full rounded-3xl" />
            </CardContent>
          </Card>

          <Card className="rounded-[2rem]">
            <CardHeader className="space-y-4 p-8">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-72" />
            </CardHeader>
            <CardContent className="space-y-4 px-8 pb-8">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}