import { useEffect, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/auth/AuthContext";
import { usersApi } from "@/api/users";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { useTheme } from "@/theme/ThemeProvider";
import type { PslLanguage, Theme } from "@/types/api";

export function SettingsPage() {
  const { session, patchSession } = useAuth();
  const phone = session?.phoneNumber ?? "";
  const { data: settings, isLoading } = useSettings(phone);
  const updateSettings = useUpdateSettings(phone);
  const { setTheme } = useTheme();

  // Keep the applied theme in sync with the stored preference.
  useEffect(() => {
    if (settings?.theme) setTheme(settings.theme);
  }, [settings?.theme, setTheme]);

  const update = (patch: Parameters<typeof updateSettings.mutate>[0]) =>
    updateSettings.mutate(patch, {
      onError: (error) =>
        toast.error("Could not save setting", {
          description: error instanceof Error ? error.message : undefined,
        }),
    });

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile and preferences
        </p>
      </div>

      <ProfileCard />

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Appearance, language and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading || !settings ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              <SettingRow label="Theme" description="Light or dark appearance">
                <Select
                  value={settings.theme}
                  onValueChange={(value) => {
                    setTheme(value as Theme);
                    update({ theme: value as Theme });
                  }}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Light">Light</SelectItem>
                    <SelectItem value="Dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>

              <SettingRow
                label="PSL translation language"
                description="Language for sign translations"
              >
                <Select
                  value={settings.pslTranslationLanguage}
                  onValueChange={(value) =>
                    update({ pslTranslationLanguage: value as PslLanguage })
                  }
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Urdu">Urdu</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>

              <SettingRow
                label="Notifications"
                description="Receive call and message notifications"
              >
                <Switch
                  checked={settings.notificationEnabled}
                  onCheckedChange={(checked) =>
                    update({ notificationEnabled: checked })
                  }
                />
              </SettingRow>

              <SettingRow
                label="Auto-download media"
                description="Automatically download received media"
              >
                <Switch
                  checked={settings.autoDownload}
                  onCheckedChange={(checked) =>
                    update({ autoDownload: checked })
                  }
                />
              </SettingRow>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  function ProfileCard() {
    const [name, setName] = useState(session?.name ?? "");
    const [saving, setSaving] = useState(false);

    const save = async () => {
      if (!name.trim()) return;
      setSaving(true);
      try {
        await usersApi.update({ phoneNumber: phone, name: name.trim() });
        patchSession({ name: name.trim() });
        toast.success("Profile updated");
      } catch (error) {
        toast.error("Could not update profile", {
          description: error instanceof Error ? error.message : undefined,
        });
      } finally {
        setSaving(false);
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your public information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Phone number</Label>
            <Input value={phone} disabled />
          </div>
          <Button
            onClick={save}
            disabled={saving || name.trim() === session?.name}
          >
            {saving && <Loader2 className="animate-spin" />}
            Save changes
          </Button>
        </CardContent>
      </Card>
    );
  }
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}
