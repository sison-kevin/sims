import SettingsPanel from "@/components/settings/settings-panel";
import { getSessionUser } from "@/lib/auth";
import { getCurrentUser, getWorkspaceSettings, listUsers } from "@/lib/store";

export default async function SettingsPage() {
  const sessionUser = await getSessionUser();
  const settings = await getWorkspaceSettings();
  const users = await listUsers();
  const currentUser = sessionUser ? await getCurrentUser(sessionUser.id) : null;

  return (
    <SettingsPanel
      initialSettings={settings}
      initialProfile={currentUser ? { fullName: currentUser.name, email: currentUser.email, avatarUrl: currentUser.avatarUrl } : settings.profile}
      initialTeam={users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: "Active",
        lastSeen: "Synced from database",
      }))}
    />
  );
}