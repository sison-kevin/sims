"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Archive, Download, LogOut, MoonStar, Palette, Plus, ShieldCheck, SunMedium, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  applyAppearancePreferences,
  persistAppearancePreferences,
  readAppearancePreferences,
  resetAppearancePreferences,
  type Accent,
  type Density,
  type ThemeMode,
} from "@/lib/appearance";
import type { WorkspaceSettingsFormValues } from "@/lib/schemas";

const profileSchema = z.object({
  fullName: z.string().min(3, "Enter your full name."),
  email: z.string().email("Enter a valid email address."),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Enter your current password."),
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().min(8, "Confirm your password."),
}).refine((value) => value.newPassword === value.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

const companySchema = z.object({
  companyName: z.string().min(2, "Company name is required."),
  businessAddress: z.string().min(10, "Enter a complete business address."),
  currency: z.string().min(1, "Select a currency."),
  timezone: z.string().min(1, "Select a timezone."),
});

const inviteSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  role: z.enum(["admin", "manager", "staff"]),
});

type TeamRole = "admin" | "manager" | "staff";
type TeamMember = { id: string; name: string; email: string; role: TeamRole; status: "Active" | "Pending"; lastSeen: string };
type SessionItem = { id: string; device: string; location: string; status: string; lastActive: string };

const demoTeam: TeamMember[] = [
  { id: "1", name: "Maya Chen", email: "maya@simventory.com", role: "manager", status: "Active", lastSeen: "2 min ago" },
  { id: "2", name: "Luis Ramos", email: "luis@simventory.com", role: "staff", status: "Active", lastSeen: "14 min ago" },
  { id: "3", name: "Ava Brooks", email: "ava@simventory.com", role: "admin", status: "Pending", lastSeen: "Invitation sent" },
];

const sessions: SessionItem[] = [
  { id: "s1", device: "MacBook Pro · Chrome", location: "Manila, PH", status: "Current session", lastActive: "Now" },
  { id: "s2", device: "iPhone 15 · Safari", location: "Manila, PH", status: "Verified", lastActive: "12 min ago" },
  { id: "s3", device: "Windows workstation · Edge", location: "Cebu, PH", status: "2FA approved", lastActive: "Yesterday" },
];

const currencyOptions = ["PHP", "USD", "EUR", "SGD", "JPY"];
const timezoneOptions = ["Asia/Manila", "Asia/Singapore", "America/New_York", "Europe/London", "UTC"];
const densityOptions = ["compact", "comfortable"] as const;

type SettingsPanelProps = {
  initialSettings?: WorkspaceSettingsFormValues;
  initialProfile?: {
    fullName: string;
    email: string;
    avatarUrl?: string | null;
  };
  initialTeam?: TeamMember[];
};

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

const defaultWorkspaceSettings: WorkspaceSettingsFormValues = {
  profile: { fullName: "Maya Chen", email: "maya@simventory.com" },
  company: {
    companyName: "Simventory Retail Group",
    businessAddress: "24 Makati Avenue, Makati City, Metro Manila",
    currency: "PHP",
    timezone: "Asia/Manila",
  },
  security: { twoFactor: true, requireSessionConfirm: true },
  notifications: { lowStock: true, sales: true, inventory: true, email: false },
  inventoryRules: { reorderLevel: 12, lowStockThreshold: 8, autoDeduct: true, skuFormat: "SKU-{category}-{number}" },
  appearance: { themeMode: "light", density: "comfortable", accent: "teal" },
};

export default function SettingsPanel({ initialSettings, initialProfile, initialTeam }: SettingsPanelProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [team, setTeam] = useState<TeamMember[]>(initialTeam ?? demoTeam);
  const [profileAvatar, setProfileAvatar] = useState<string | undefined>(initialProfile?.avatarUrl ?? undefined);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string | undefined>(initialSettings?.company?.logoUrl ?? undefined);
  const [uploadingCompanyLogo, setUploadingCompanyLogo] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingInvite, setSavingInvite] = useState(false);
  const [savingInventory, setSavingInventory] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingAppearance, setSavingAppearance] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const initialAppearance = initialSettings?.appearance ?? readAppearancePreferences();
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialAppearance.themeMode);
  const [density, setDensity] = useState<Density>(initialAppearance.density);
  const [accent, setAccent] = useState<Accent>(initialAppearance.accent);
  const [security, setSecurity] = useState(initialSettings?.security ?? defaultWorkspaceSettings.security);
  const [notifications, setNotifications] = useState(initialSettings?.notifications ?? defaultWorkspaceSettings.notifications);
  const [inventoryRules, setInventoryRules] = useState(initialSettings?.inventoryRules ?? defaultWorkspaceSettings.inventoryRules);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const companyLogoInputRef = useRef<HTMLInputElement | null>(null);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: initialProfile ?? initialSettings?.profile ?? defaultWorkspaceSettings.profile,
  });

  const companyForm = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    mode: "onChange",
    defaultValues: initialSettings?.company ?? defaultWorkspaceSettings.company,
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const inviteForm = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    mode: "onChange",
    defaultValues: { email: "", role: "staff" },
  });

  const profileName = useWatch({ control: profileForm.control, name: "fullName" });

  useEffect(() => {
    const preferences = { themeMode, density, accent };
    applyAppearancePreferences(preferences);
    persistAppearancePreferences(preferences);
  }, [accent, density, themeMode]);

  useEffect(() => {
    if (!initialSettings) {
      return;
    }

    profileForm.reset(initialProfile ?? initialSettings.profile);
    companyForm.reset(initialSettings.company);
    setCompanyLogo(initialSettings.company.logoUrl ?? undefined);
  }, [companyForm, initialProfile, initialSettings, profileForm]);

  function emitSuccess(title: string, description: string) {
    toast({ title, description });
  }

  async function persistSettings(payload: WorkspaceSettingsFormValues) {
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null) as { error?: string } | null;
      throw new Error(data?.error ?? "Unable to save settings");
    }
  }

  function buildCompanyPayload(companyOverride?: Partial<WorkspaceSettingsFormValues["company"]>) {
    return {
      ...companyForm.getValues(),
      logoUrl: companyLogo,
      ...companyOverride,
      logoUrl: companyOverride?.logoUrl ?? companyLogo,
    };
  }

  async function uploadCompanyLogo(file: File) {
    const previousLogo = companyLogo;
    const previewUrl = URL.createObjectURL(file);
    setUploadingCompanyLogo(true);
    setCompanyLogo(previewUrl);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/settings/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(data?.error ?? "Unable to upload company logo");
      }

      const data = await response.json() as { avatarUrl?: string };
      if (!data.avatarUrl) {
        throw new Error("Unable to upload company logo");
      }

      setCompanyLogo(data.avatarUrl);
      await persistSettings(buildSettingsPayload({ company: buildCompanyPayload({ logoUrl: data.avatarUrl }) }));
      emitSuccess("Logo uploaded", "Company logo saved and applied to the workspace.");
      router.refresh();
    } catch (error) {
      setCompanyLogo(previousLogo);
      emitSuccess("Logo upload failed", error instanceof Error ? error.message : "Unable to upload company logo.");
    } finally {
      setUploadingCompanyLogo(false);
      URL.revokeObjectURL(previewUrl);
      if (companyLogoInputRef.current) {
        companyLogoInputRef.current.value = "";
      }
    }
  }

  async function uploadAvatar(file: File) {
    const previousAvatar = profileAvatar;
    const previewUrl = URL.createObjectURL(file);
    setUploadingAvatar(true);
    setProfileAvatar(previewUrl);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/settings/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(data?.error ?? "Unable to upload avatar");
      }

      const data = await response.json() as { avatarUrl?: string };
      if (!data.avatarUrl) {
        throw new Error("Unable to upload avatar");
      }

      setProfileAvatar(data.avatarUrl);
      emitSuccess("Avatar uploaded", "Your avatar is in Supabase. Save the profile to attach it to your account.");
    } catch (error) {
      setProfileAvatar(previousAvatar);
      emitSuccess("Avatar upload failed", error instanceof Error ? error.message : "Unable to upload avatar.");
    } finally {
      setUploadingAvatar(false);
      URL.revokeObjectURL(previewUrl);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  }

  function buildSettingsPayload(overrides?: Partial<WorkspaceSettingsFormValues>): WorkspaceSettingsFormValues {
    const companyValues = buildCompanyPayload(overrides?.company);
    return {
      profile: profileForm.getValues(),
      company: companyValues,
      security,
      notifications,
      inventoryRules,
      appearance: { themeMode, density, accent },
      ...overrides,
      company: companyValues,
    };
  }

  async function saveSettings(setSaving: (value: boolean) => void, onSuccess: () => void, payload = buildSettingsPayload()) {
    setSaving(true);
    try {
      await persistSettings(payload);
      onSuccess();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function resetAppearance() {
    const preferences = resetAppearancePreferences();
    setThemeMode(preferences.themeMode);
    setDensity(preferences.density);
    setAccent(preferences.accent);
    applyAppearancePreferences(preferences);

    try {
      await persistSettings({ ...buildSettingsPayload({ appearance: preferences }), appearance: preferences });
      emitSuccess("Appearance reset", "Theme, density, and accent were restored to defaults.");
    } catch (error) {
      emitSuccess("Appearance reset", error instanceof Error ? error.message : "Unable to save appearance settings.");
    }
  }

  return (
    <div className="space-y-6" suppressHydrationWarning>
      <div className="flex flex-col gap-4 rounded-[28px] border border-border bg-[linear-gradient(135deg,rgba(15,118,110,0.08),rgba(59,130,246,0.06))] p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="uppercase tracking-[0.2em]">System settings</Badge>
            <Badge>Production ready</Badge>
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Settings</h2>
            <p className="max-w-2xl text-slate-600 dark:text-slate-300">Centralized configuration for identity, company policy, team access, inventory behavior, and system experience.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-background/80 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Active controls</div>
            <div className="mt-1 text-2xl font-semibold">8 modules</div>
          </div>
          <div className="rounded-2xl border border-border bg-background/80 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Security posture</div>
            <div className="mt-1 text-2xl font-semibold text-accent">Enabled</div>
          </div>
          <div className="rounded-2xl border border-border bg-background/80 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Last saved</div>
            <div className="mt-1 text-2xl font-semibold">Today</div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full flex-wrap gap-2 overflow-x-auto rounded-[20px] p-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="team">Team & Roles</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Rules</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="exports">Data Export</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Profile settings</CardTitle>
                  <CardDescription>Manage your workspace identity and secure sign-in details.</CardDescription>
                </div>
                <Badge variant="secondary">Instant validation</Badge>
              </div>
              <Separator />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-5 rounded-3xl border border-border/70 bg-white/70 p-5 dark:bg-white/5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profileAvatar} alt="Profile avatar" />
                    <AvatarFallback>{getInitials(profileName || initialProfile?.fullName || "MC")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">Avatar preview</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Upload an avatar to personalize the workspace identity.</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="avatar-upload"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) {
                        return;
                      }

                      void uploadAvatar(file);
                    }}
                  />
                  <Button variant="outline" type="button" onClick={() => avatarInputRef.current?.click()} disabled={uploadingAvatar || savingProfile}>
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadingAvatar ? "Uploading..." : "Upload avatar"}
                  </Button>
                </div>
              </div>

              <Form {...profileForm}>
                <form
                  className="grid gap-4 md:grid-cols-2"
                  onSubmit={profileForm.handleSubmit(async (values) => {
                    setSavingProfile(true);
                    try {
                      const response = await fetch("/api/users/me", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...values, avatarUrl: profileAvatar?.startsWith("blob:") ? undefined : profileAvatar }),
                      });

                      if (!response.ok) {
                        const data = await response.json().catch(() => null) as { error?: string } | null;
                        throw new Error(data?.error ?? "Unable to update profile");
                      }

                      const data = await response.json();
                      profileForm.reset({ fullName: data.user.name, email: data.user.email });
                      setProfileAvatar(data.user.avatarUrl ?? profileAvatar);
                      emitSuccess("Profile updated", `${data.user.name} has been saved successfully.`);
                    } catch (error) {
                      emitSuccess("Profile update failed", error instanceof Error ? error.message : "Unable to update profile.");
                    } finally {
                      setSavingProfile(false);
                    }
                  })}
                >
                  <FormField control={profileForm.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl><Input {...field} placeholder="Maya Chen" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={profileForm.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl><Input {...field} placeholder="maya@company.com" type="email" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="md:col-span-2 flex justify-end">
                    <Button type="submit" disabled={!profileForm.formState.isValid || savingProfile || uploadingAvatar} className="min-w-40">
                      {savingProfile ? "Saving..." : "Save profile"}
                    </Button>
                  </div>
                </form>
              </Form>

              <Separator />

              <Card className="border-border/70 bg-[color:var(--color-card)]">
                <CardHeader>
                  <CardTitle>Change password</CardTitle>
                  <CardDescription>Rotate your password from time to time to keep the account secure.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form
                      className="grid gap-4 md:grid-cols-3"
                      onSubmit={passwordForm.handleSubmit(async (values) => {
                        setSavingPassword(true);
                        try {
                          const response = await fetch("/api/auth/password", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(values),
                          });

                          if (!response.ok) {
                            const data = await response.json().catch(() => null) as { error?: string } | null;
                            throw new Error(data?.error ?? "Unable to change password");
                          }

                          passwordForm.reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
                          emitSuccess("Password changed", "Your password has been updated.");
                        } catch (error) {
                          emitSuccess("Password change failed", error instanceof Error ? error.message : "Unable to change password.");
                        } finally {
                          setSavingPassword(false);
                        }
                      })}
                    >
                      <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current password</FormLabel>
                          <FormControl><Input {...field} type="password" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                        <FormItem>
                          <FormLabel>New password</FormLabel>
                          <FormControl><Input {...field} type="password" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm password</FormLabel>
                          <FormControl><Input {...field} type="password" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="md:col-span-3 flex justify-end">
                        <Button type="submit" disabled={!passwordForm.formState.isValid || savingPassword} variant="secondary" className="min-w-44">
                          {savingPassword ? "Updating..." : "Change password"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company configuration</CardTitle>
              <CardDescription>Define the operational identity used across inventory workflows and exports.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 rounded-3xl border border-border/70 bg-white/70 p-5 dark:bg-white/5">
                <Avatar className="h-14 w-14 rounded-2xl">
                  <AvatarImage src={companyLogo} alt="Company logo" />
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold">Company logo</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Upload a logo for reports, exports, and branded system surfaces.</div>
                </div>
                <input
                  ref={companyLogoInputRef}
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    void uploadCompanyLogo(file);
                  }}
                />
                <Button variant="outline" type="button" onClick={() => companyLogoInputRef.current?.click()} disabled={uploadingCompanyLogo || savingCompany}>
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadingCompanyLogo ? "Uploading..." : "Upload logo"}
                </Button>
              </div>

              <Form {...companyForm}>
                <form
                  className="grid gap-4 md:grid-cols-2"
                  onSubmit={companyForm.handleSubmit(async (values) => {
                    await saveSettings(setSavingCompany, () => emitSuccess("Company settings saved", `${values.companyName} configuration updated.`), buildSettingsPayload({ company: values }));
                  })}
                >
                  <FormField control={companyForm.control} name="companyName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company name</FormLabel>
                      <FormControl><Input {...field} placeholder="Simventory Retail Group" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={companyForm.control} name="currency" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Select value={field.value} onChange={field.onChange}>
                          {currencyOptions.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={companyForm.control} name="timezone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <FormControl>
                        <Select value={field.value} onChange={field.onChange}>
                          {timezoneOptions.map((timezone) => <option key={timezone} value={timezone}>{timezone}</option>)}
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={companyForm.control} name="businessAddress" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Business address</FormLabel>
                      <FormControl><Textarea {...field} placeholder="Office address used for invoices, backups, and reports." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="md:col-span-2 flex justify-end">
                    <Button type="submit" disabled={!companyForm.formState.isValid || savingCompany} className="min-w-44">
                      {savingCompany ? "Saving..." : "Save company"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
              <div>
                <CardTitle>Team & roles</CardTitle>
                <CardDescription>Invite members, assign access, and control workspace authority instantly.</CardDescription>
              </div>
              <Button onClick={() => setInviteOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Invite user
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-3xl border border-border/70 bg-white/70 dark:bg-white/5">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last seen</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">{member.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.role === "admin" ? "default" : member.role === "manager" ? "secondary" : "outline"}>{member.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.status === "Active" ? "default" : "outline"}>{member.status}</Badge>
                        </TableCell>
                        <TableCell>{member.lastSeen}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button variant="ghost" size="sm">•••</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={async () => {
                                const response = await fetch(`/api/users/${member.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ role: "admin" }),
                                });
                                if (!response.ok) {
                                  const data = await response.json().catch(() => null) as { error?: string } | null;
                                  emitSuccess("Role update failed", data?.error ?? "Unable to update role.");
                                  return;
                                }
                                const data = await response.json();
                                setTeam((current) => current.map((row) => row.id === member.id ? { ...row, role: data.user.role } : row));
                                emitSuccess("Role updated", `${member.name} is now an admin.`);
                              }}>Make admin</DropdownMenuItem>
                              <DropdownMenuItem onClick={async () => {
                                const response = await fetch(`/api/users/${member.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ role: "manager" }),
                                });
                                if (!response.ok) {
                                  const data = await response.json().catch(() => null) as { error?: string } | null;
                                  emitSuccess("Role update failed", data?.error ?? "Unable to update role.");
                                  return;
                                }
                                const data = await response.json();
                                setTeam((current) => current.map((row) => row.id === member.id ? { ...row, role: data.user.role } : row));
                                emitSuccess("Role updated", `${member.name} is now a manager.`);
                              }}>Make manager</DropdownMenuItem>
                              <DropdownMenuItem onClick={async () => {
                                const response = await fetch(`/api/users/${member.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ role: "staff" }),
                                });
                                if (!response.ok) {
                                  const data = await response.json().catch(() => null) as { error?: string } | null;
                                  emitSuccess("Role update failed", data?.error ?? "Unable to update role.");
                                  return;
                                }
                                const data = await response.json();
                                setTeam((current) => current.map((row) => row.id === member.id ? { ...row, role: data.user.role } : row));
                                emitSuccess("Role updated", `${member.name} is now staff.`);
                              }}>Make staff</DropdownMenuItem>
                              <DropdownMenuItem danger onClick={() => setRemoveTarget(member)}>Remove user</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security posture</CardTitle>
              <CardDescription>Authenticate your workspace with session controls, device management, and optional 2FA.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-border/70 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold">Two-factor authentication</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Require a code during sign-in for sensitive operations.</div>
                    </div>
                    <Switch checked={security.twoFactor} onCheckedChange={(checked) => setSecurity((current) => ({ ...current, twoFactor: checked }))} />
                  </div>
                </div>
                <div className="rounded-3xl border border-border/70 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold">Session confirmation</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Ask for confirmation before sensitive account changes.</div>
                    </div>
                    <Switch checked={security.requireSessionConfirm} onCheckedChange={(checked) => setSecurity((current) => ({ ...current, requireSessionConfirm: checked }))} />
                  </div>
                </div>
              </div>
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Active sessions</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Devices currently signed in to your account.</div>
                  </div>
                  <Button variant="outline" onClick={() => setLogoutDialogOpen(true)}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out all devices
                  </Button>
                </div>
                <div className="grid gap-3">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex flex-col gap-2 rounded-3xl border border-border/70 p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-medium">{session.device}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{session.location} · {session.lastActive}</div>
                      </div>
                      <Badge variant="outline">{session.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={async () => {
                  await saveSettings(setSavingSecurity, () => emitSuccess("Security settings saved", "Security preferences were stored in the database."), buildSettingsPayload({ security }));
                }} disabled={savingSecurity}>{savingSecurity ? "Saving..." : "Save security"}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory rules</CardTitle>
              <CardDescription>Global fallback rules that directly influence stock behavior across the system.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-border/70 p-5">
                  <div className="text-sm text-slate-500 dark:text-slate-400">Default reorder level</div>
                  <div className="mt-2"><Input type="number" value={inventoryRules.reorderLevel} onChange={(event) => setInventoryRules((current) => ({ ...current, reorderLevel: Number(event.target.value) }))} /></div>
                </div>
                <div className="rounded-3xl border border-border/70 p-5">
                  <div className="text-sm text-slate-500 dark:text-slate-400">Low stock threshold</div>
                  <div className="mt-2"><Input type="number" value={inventoryRules.lowStockThreshold} onChange={(event) => setInventoryRules((current) => ({ ...current, lowStockThreshold: Number(event.target.value) }))} /></div>
                </div>
                <div className="rounded-3xl border border-border/70 p-5 xl:col-span-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold">Auto stock deduction</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Reduce inventory automatically when sales are recorded.</div>
                    </div>
                    <Switch checked={inventoryRules.autoDeduct} onCheckedChange={(checked) => setInventoryRules((current) => ({ ...current, autoDeduct: checked }))} />
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-border/70 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">SKU format rule</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Optional pattern used when generating new catalog identifiers.</div>
                  </div>
                  <Badge variant="secondary">Advanced</Badge>
                </div>
                <Input value={inventoryRules.skuFormat} onChange={(event) => setInventoryRules((current) => ({ ...current, skuFormat: event.target.value }))} />
              </div>
              <div className="flex justify-end">
                <Button onClick={async () => {
                  await saveSettings(setSavingInventory, () => emitSuccess("Inventory rules saved", "Global stock behavior has been updated."), buildSettingsPayload({ inventoryRules }));
                }} disabled={savingInventory}>{savingInventory ? "Saving..." : "Save inventory rules"}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Stripe-style preference toggles for operational alerts and email delivery.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                ["Low stock alerts", "lowStock", "Notify when products fall below threshold."],
                ["Sales notifications", "sales", "Receive updates after completed sales."],
                ["Inventory updates", "inventory", "Get alerts for manual stock movements."],
                ["Email delivery", "email", "Send alerts to your inbox as well."],
              ].map(([label, key, description]) => (
                <div key={key} className="flex items-center justify-between rounded-3xl border border-border/70 p-4">
                  <div>
                    <div className="font-medium">{label}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{description}</div>
                  </div>
                  <Switch checked={(notifications as Record<string, boolean>)[key]} onCheckedChange={(checked) => setNotifications((current) => ({ ...current, [key]: checked }))} />
                </div>
              ))}
              <div className="flex justify-end">
                <Button onClick={async () => {
                  await saveSettings(setSavingNotifications, () => emitSuccess("Notifications saved", "Notification preferences were stored in the database."), buildSettingsPayload({ notifications }));
                }} disabled={savingNotifications}>{savingNotifications ? "Saving..." : "Save notifications"}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data export</CardTitle>
              <CardDescription>Generate operational exports and backups from a single control panel.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <Button variant="outline" className="justify-start"><Download className="mr-2 h-4 w-4" />Export inventory CSV</Button>
                <Button variant="outline" className="justify-start"><Archive className="mr-2 h-4 w-4" />Export sales PDF</Button>
                <Button variant="destructive" className="justify-start" onClick={() => emitSuccess("Backup prepared", "Full system backup has been queued as a mock export.")}><ShieldCheck className="mr-2 h-4 w-4" />Download system backup</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Control density, theme, and the overall feel of the workspace shell.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-border/70 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Theme mode</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Toggle the visual tone for the workspace.</div>
                    </div>
                    <Switch checked={themeMode === "dark"} onCheckedChange={(checked) => setThemeMode(checked ? "dark" : "light")} />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">{themeMode === "dark" ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />} {themeMode === "dark" ? "Dark" : "Light"}</div>
                </div>
                <div className="rounded-3xl border border-border/70 p-5">
                  <div className="font-semibold">UI density</div>
                  <div className="mt-3">
                    <Select value={density} onChange={(event) => setDensity(event.target.value as (typeof densityOptions)[number])}>
                      {densityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    </Select>
                  </div>
                </div>
                <div className="rounded-3xl border border-border/70 p-5">
                  <div className="font-semibold">Accent</div>
                  <div className="mt-3">
                    <Select value={accent} onChange={(event) => setAccent(event.target.value as Accent)}>
                      <option value="teal">Teal</option>
                      <option value="blue">Blue</option>
                      <option value="violet">Violet</option>
                      <option value="slate">Slate</option>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-border/70 p-5">
                <div className="flex items-center gap-3">
                  <Palette className="h-4 w-4 text-accent" />
                  <div>
                    <div className="font-semibold">Live preview</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Switching these controls updates the workspace tone and density configuration.</div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge>Accent {accent}</Badge>
                  <Badge variant="outline">{density}</Badge>
                  <Badge variant="secondary">{themeMode}</Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button type="button" variant="outline" onClick={resetAppearance}>
                    Reset to defaults
                  </Button>
                  <Button type="button" onClick={async () => {
                    await saveSettings(setSavingAppearance, () => emitSuccess("Appearance saved", "Theme, density, and accent were stored in the database."), buildSettingsPayload({ appearance: { themeMode, density, accent } }));
                  }} disabled={savingAppearance}>{savingAppearance ? "Saving..." : "Save appearance"}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite team member</DialogTitle>
            <DialogDescription>Send a new workspace invitation with a role assignment.</DialogDescription>
          </DialogHeader>
          <Form {...inviteForm}>
            <form
              className="space-y-4"
              onSubmit={inviteForm.handleSubmit(async (values) => {
                setSavingInvite(true);
                try {
                  const response = await fetch("/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: values.email.split("@")[0],
                      email: values.email,
                      password: `Invite-${crypto.randomUUID().slice(0, 8)}!`,
                      role: values.role,
                    }),
                  });

                  if (!response.ok) {
                    const data = await response.json().catch(() => null) as { error?: string } | null;
                    throw new Error(data?.error ?? "Unable to invite user");
                  }

                  const data = await response.json();
                  setInviteOpen(false);
                  inviteForm.reset({ email: "", role: "staff" });
                  setTeam((current) => [{ id: data.user.id, name: data.user.name, email: data.user.email, role: data.user.role, status: "Active", lastSeen: "Synced from database" }, ...current]);
                  emitSuccess("Invitation sent", `${values.email} was invited as ${values.role}.`);
                } catch (error) {
                  emitSuccess("Invitation failed", error instanceof Error ? error.message : "Unable to invite user.");
                } finally {
                  setSavingInvite(false);
                }
              })}
            >
              <FormField control={inviteForm.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl><Input {...field} type="email" placeholder="new.member@company.com" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={inviteForm.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select value={field.value} onChange={field.onChange}>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="staff">Staff</option>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={!inviteForm.formState.isValid || savingInvite}>{savingInvite ? "Sending..." : "Send invite"}</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove team member</DialogTitle>
            <DialogDescription>This action removes access for the selected user immediately.</DialogDescription>
          </DialogHeader>
          <div className="rounded-3xl border border-border/70 p-4">
            <div className="font-medium">{removeTarget?.name}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{removeTarget?.email}</div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => {
              if (!removeTarget) return;
              const response = await fetch(`/api/users/${removeTarget.id}`, { method: "DELETE" });
              if (!response.ok) {
                const data = await response.json().catch(() => null) as { error?: string } | null;
                emitSuccess("Removal failed", data?.error ?? "Unable to remove user.");
                return;
              }
              setTeam((current) => current.filter((member) => member.id !== removeTarget.id));
              emitSuccess("User removed", `${removeTarget.name} no longer has access.`);
              setRemoveTarget(null);
            }}>Remove user</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log out all devices</DialogTitle>
            <DialogDescription>This will terminate all active sessions except the current one.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 rounded-3xl border border-border/70 p-4">
            <ShieldCheck className="h-5 w-5 text-accent" />
            <div className="text-sm text-slate-500 dark:text-slate-400">Useful if a device is lost, shared, or compromised.</div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              setLogoutDialogOpen(false);
              emitSuccess("All devices signed out", "Mock logout completed for every session.");
            }}>Confirm logout</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}