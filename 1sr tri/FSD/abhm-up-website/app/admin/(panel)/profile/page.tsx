"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import Container from "@/components/Container";
import PageTitle from "@/components/PageTitle";
import Button from "@/components/Button";
import { adminFetch } from "@/lib/security/adminFetch";

type ProfileData = {
  _id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await adminFetch("/api/admin/profile");
      if (!res.ok) throw new Error("Failed to load profile");
      
      const data = await res.json();
      setProfile(data.user);
      setName(data.user.name);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load profile"));
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const updates: {
        name: string;
        currentPassword?: string;
        newPassword?: string;
      } = { name };

      if (currentPassword && newPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error("New passwords do not match");
        }
        if (newPassword.length < 6) {
          throw new Error("New password must be at least 6 characters");
        }
        updates.currentPassword = currentPassword;
        updates.newPassword = newPassword;
      }

      const res = await adminFetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setProfile(data.user);
      setSuccess("Profile updated successfully");
      setEditing(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update profile"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    try {
      await adminFetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  if (loading) {
    return (
      <div>
        <PageTitle title="Profile" subtitle="Manage your account settings" tone="dark" />
        <Container className="pb-14">
          <Card>
            <div className="text-center text-black/60">Loading...</div>
          </Card>
        </Container>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <PageTitle title="Profile" subtitle="Manage your account settings" tone="dark" />
        <Container className="pb-14">
          <Card>
            <div className="text-center text-red-600">Failed to load profile</div>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div>
      <PageTitle title="Profile" subtitle="Manage your account settings" tone="dark" />
      
      <Container className="pb-14">
        <div className="space-y-6">
          {/* Account Information */}
          <Card>
            <h3 className="text-lg font-bold mb-4 text-black">Account Information</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                {success}
              </div>
            )}

            {!editing ? (
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold text-black/60">Name</div>
                  <div className="text-black mt-1">{profile.name}</div>
                </div>
                
                <div>
                  <div className="text-sm font-semibold text-black/60">Email</div>
                  <div className="text-black mt-1">{profile.email}</div>
                </div>
                
                <div>
                  <div className="text-sm font-semibold text-black/60">Role</div>
                  <div className="text-black mt-1 capitalize">{profile.role}</div>
                </div>
                
                {profile.lastLoginAt && (
                  <div>
                    <div className="text-sm font-semibold text-black/60">Last Login</div>
                    <div className="text-black mt-1">
                      {new Date(profile.lastLoginAt).toLocaleString()}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Button onClick={() => setEditing(true)}>Edit Profile</Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <label className="block">
                  <span className="text-sm font-semibold text-black/80">Name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-orange-500"
                    required
                  />
                </label>

                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-bold text-black mb-4">
                    Change Password (Optional)
                  </h4>
                  
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-sm font-semibold text-black/80">Current Password</span>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-orange-500"
                        autoComplete="current-password"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-semibold text-black/80">New Password</span>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-orange-500"
                        autoComplete="new-password"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-semibold text-black/80">Confirm New Password</span>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-orange-500"
                        autoComplete="new-password"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditing(false);
                      setName(profile.name);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setError(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </Card>

          {/* Logout Section */}
          <Card className="bg-red-50/50">
            <h3 className="text-lg font-bold mb-2 text-black">Logout</h3>
            <p className="text-sm text-black/70 mb-4">
              Sign out of your admin account
            </p>
            <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
              Logout
            </Button>
          </Card>
        </div>
      </Container>
    </div>
  );
}
