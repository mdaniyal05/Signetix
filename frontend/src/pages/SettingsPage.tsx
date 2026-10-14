import { useEffect, useRef, useState, type ReactNode } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/auth/AuthContext";
import { usersApi } from "@/api/users";
import { cloudinaryApi } from "@/api/cloudinary";
import { UserAvatar } from "@/components/common/UserAvatar";
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
import { disablePush, enablePush } from "@/lib/push";
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

  // Toggling notifications also subscribes/unsubscribes this device for web push.
  const handleNotificationToggle = async (checked: boolean) => {
    if (checked) {
      try {
        await enablePush(phone);
        toast.success("Notifications enabled on this device");
      } catch (error) {
        toast.error("Could not enable notifications", {
          description: error instanceof Error ? error.message : undefined,
        });
        return;
      }
    } else {
      await disablePush(phone).catch(() => undefined);
    }
    update({ notificationEnabled: checked });
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile and preferences
        </p>
      </div>

      <ProfileCard
        phone={phone}
        name={session?.name ?? ""}
        status={session?.profileStatus ?? ""}
        profilePicture={session?.profilePicture}
        patchSession={patchSession}
      />

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
                description="Language for recognized sign captions and speech"
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
                    <SelectItem value="Urdu">Urdu (اردو)</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>

              <SettingRow
                label="Notifications"
                description="Receive call and message notifications"
              >
                <Switch
                  checked={settings.notificationEnabled}
                  onCheckedChange={handleNotificationToggle}
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
}

interface ProfileCardProps {
  phone: string;
  name: string;
  status: string;
  profilePicture?: string;
  patchSession: ReturnType<typeof useAuth>["patchSession"];
}

function ProfileCard({
  phone,
  name: initialName,
  status: initialStatus,
  profilePicture,
  patchSession,
}: ProfileCardProps) {
  const [name, setName] = useState(initialName);
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onPickPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    setUploadingPhoto(true);
    try {
      const url = await cloudinaryApi.uploadProfilePicture(phone, file);
      await usersApi.update({ phoneNumber: phone, profilePicture: url });
      patchSession({ profilePicture: url });
      toast.success("Photo updated");
    } catch (error) {
      toast.error("Could not update photo", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const dirty = name.trim() !== initialName || status.trim() !== initialStatus;

  const save = async () => {
    if (!name.trim() || !dirty) return;
    setSaving(true);
    try {
      await usersApi.update({
        phoneNumber: phone,
        name: name.trim(),
        profileStatus: status.trim(),
      });
      patchSession({ name: name.trim(), profileStatus: status.trim() });
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
        <div className="flex items-center gap-4">
          <div className="relative">
            <UserAvatar
              name={name || "User"}
              src={profilePicture}
              className="size-16"
            />
            {uploadingPhoto && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                <Loader2 className="size-5 animate-spin text-white" />
              </div>
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickPhoto}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
            >
              <Camera className="size-4" />
              Change photo
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-name">Name</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-status">Status</Label>
          <Input
            id="profile-status"
            placeholder="Available"
            maxLength={80}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Phone number</Label>
          <Input value={phone} disabled />
        </div>
        <Button onClick={save} disabled={saving || !name.trim() || !dirty}>
          {saving && <Loader2 className="animate-spin" />}
          Save changes
        </Button>
      </CardContent>
    </Card>
  );
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
