import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listUsers } from "@/lib/store";
import UsersManager from "@/components/users/users-manager";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getAvatarSeed(name: string, email: string) {
  const seed = encodeURIComponent(`${name}-${email}`.trim().toLowerCase());
  const initials = encodeURIComponent(getInitials(name) || "U");

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${name}">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f766e" />
          <stop offset="100%" stop-color="#115e59" />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="64" fill="url(#g)" />
      <circle cx="64" cy="52" r="28" fill="#ffffff" fill-opacity="0.15" />
      <path d="M28 104c7.5-18 23.2-30 36-30s28.5 12 36 30" fill="#ffffff" fill-opacity="0.15" />
      <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="40" font-weight="700">${initials}</text>
      <metadata>${seed}</metadata>
    </svg>
  `)}`;
}

export default async function UsersPage() {
  const users = await listUsers();

  return (
    <div className="space-y-6">
      <UsersManager />
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Users</h2>
        <p className="text-slate-500 dark:text-slate-400">Admin-only account directory and role registry.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspace users</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-14">Profile</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="pl-14">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl ?? getAvatarSeed(user.name, user.email)} alt={`${user.name} profile picture`} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell><Badge>{user.role}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}