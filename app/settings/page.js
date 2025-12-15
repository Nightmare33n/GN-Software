"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import config from "@/config";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    skills: [],
    role: "client",
  });
  const [skillInput, setSkillInput] = useState("");

  // Fetch profile on mount
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get("/api/user/profile");
      setProfile({
        name: data.user.name || "",
        bio: data.user.bio || "",
        skills: data.user.skills || [],
        role: data.user.role || "client",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.patch("/api/user/profile", profile);
      toast.success("Profile updated successfully!");

      // Redirect to dashboard after save
      router.push("/dashboard");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && profile.skills.length < 20) {
      setProfile({
        ...profile,
        skills: [...profile.skills, skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const removeSkill = (index) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-2xl mx-auto">
        {/* Settings Page START */}
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
              Profile Settings
            </h1>
            <p className="text-base-content/60">
              Manage your profile and account settings
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="card bg-base-200">
              <div className="card-body space-y-4">
                {/* Name */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Name</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Role */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Account Type</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={profile.role}
                    onChange={(e) =>
                      setProfile({ ...profile, role: e.target.value })
                    }
                  >
                    <option value="client">Client - I want to hire freelancers</option>
                    <option value="freelancer">Freelancer - I want to offer services</option>
                  </select>
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      Freelancers can create and manage gigs
                    </span>
                  </label>
                </div>

                {/* Bio */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Bio</span>
                    <span className="label-text-alt">
                      {profile.bio.length}/500
                    </span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24"
                    placeholder="Tell us about yourself..."
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile({ ...profile, bio: e.target.value })
                    }
                    maxLength={500}
                  />
                </div>

                {/* Skills */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Skills</span>
                    <span className="label-text-alt">
                      {profile.skills.length}/20
                    </span>
                  </label>

                  {/* Skills list */}
                  {profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {profile.skills.map((skill, index) => (
                        <div
                          key={index}
                          className="badge badge-primary gap-2"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(index)}
                            className="btn btn-ghost btn-xs btn-circle"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add skill input */}
                  <div className="join">
                    <input
                      type="text"
                      className="input input-bordered join-item flex-1"
                      placeholder="e.g. React, Node.js, Design"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      disabled={profile.skills.length >= 20}
                    />
                    <button
                      type="button"
                      className="btn btn-primary join-item"
                      onClick={addSkill}
                      disabled={!skillInput.trim() || profile.skills.length >= 20}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
        {/* Settings Page END */}
      </section>
    </main>
  );
}
