"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Pencil, Upload, X } from "lucide-react";
import { useUserStore } from "@/app/hooks/useUserStore";
import { z } from "zod";
import { toast } from "sonner";
// Import skeletons from loading.tsx
import { ProfileSkeleton, StatsSkeleton } from "@/app/(home)/loading";

// Define validation schema
const userProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  role: z
    .string()
    .min(1, "Role is required")
    .max(100, "Role must be less than 100 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  skills: z.string().optional(),
  avatar: z.string().optional(),
});

export function UserProfile() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    skills: "",
    avatar: "",
  });
  const [errors, setErrors] = useState<{
    name?: string;
    role?: string;
    email?: string;
    skills?: string;
    avatar?: string;
  }>({});
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  // Get user data and actions from the store
  const user = useUserStore((state) => state.user);
  const isLoading = useUserStore((state) => state.isLoading);
  const initializeUser = useUserStore((state) => state.initializeUser);
  const updateUser = useUserStore((state) => state.updateUser);
  const updateSkills = useUserStore((state) => state.updateSkills);
  const updateAvatar = useUserStore((state) => state.updateAvatar);
  // Initialize user on component mount
  useEffect(() => {
    if (isLoading) {
      initializeUser();
    }
  }, [isLoading, initializeUser]);

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        role: user.role,
        email: user.email,
        skills: Array.isArray(user.skills) ? user.skills.join(", ") : "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors({
        ...errors,
        avatar: "Please upload an image file",
      });
      return;
    }

    // Create preview URL for the avatar
    const previewUrl = URL.createObjectURL(file);
    setPreviewAvatar(previewUrl);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;

      // Set the Base64 string to formData
      setFormData({
        ...formData,
        avatar: base64String,
      });

      // Clear any previous errors
      if (errors.avatar) {
        setErrors({
          ...errors,
          avatar: undefined,
        });
      }
    };

    reader.onerror = () => {
      setErrors({
        ...errors,
        avatar: "Failed to process image. Please try again.",
      });
    };

    // Read the file as a data URL (Base64)
    reader.readAsDataURL(file);
  };

  const clearAvatarPreview = () => {
    if (previewAvatar) {
      URL.revokeObjectURL(previewAvatar);
    }
    setPreviewAvatar(null);
    setFormData({
      ...formData,
      avatar: user?.avatar || "",
    });
  };

  const validateForm = (): boolean => {
    try {
      userProfileSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleEditProfile = async () => {
    if (!validateForm()) return;
    console.log("formData", formData);

    try {
      // Update basic user info first
      await updateUser({
        name: formData.name,
        role: formData.role,
        email: formData.email,
      });

      if (formData.avatar && formData.avatar.startsWith("data:image")) {
        await updateAvatar(formData.avatar);
      }

      // Update skills separately as it needs special processing
      await updateSkills(
        formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      );

      // Clean up preview URL if needed
      if (previewAvatar) {
        URL.revokeObjectURL(previewAvatar);
        setPreviewAvatar(null);
      }

      toast.success("Profile updated successfully", {
        richColors: true,
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const openEditDialog = () => {
    if (!user) return;

    setFormData({
      name: user.name,
      role: user.role,
      email: user.email,
      skills: user.skills.join(", "),
      avatar: user.avatar || "",
    });
    setPreviewAvatar(null);
    setErrors({});
    setIsEditDialogOpen(true);
  };

  if (isLoading || !user) {
    return (
      <div className="container p-6">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">
          User Profile
        </h1>
        <ProfileSkeleton />
        <StatsSkeleton />
      </div>
    );
  }

  return (
    <div className="container p-6">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">User Profile</h1>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Profile Image */}
            <div className="relative">
              <Avatar className="w-32 h-32">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
                onClick={openEditDialog}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 bg-white dark:bg-gray-900 ">
              {/* Email & Name */}
              <div className="mb-4 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {user.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              </div>

              {/* Role */}
              <div className="mb-4 flex gap-4 items-center">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300  tracking-wider mb-1">
                  Role:
                </h4>
                <p className="text-base mb-1 text-gray-800 dark:text-white">
                  {user.role}
                </p>
              </div>

              {/* Skills */}
              <div className="mb-4 flex gap-4 items-center">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300  tracking-wider mb-2">
                  Skills:
                </h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  {Array.isArray(user.skills) && user.skills.length > 0 ? (
                    user.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-sm px-3 py-1"
                      >
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No skills added yet
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Button onClick={openEditDialog} className="mt-4 sm:mt-0">
              <Pencil className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold dark:text-white">
              {user.stats.tasks}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total tasks assigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold dark:text-white">
              {user.stats.projects}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Current active projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold dark:text-white">
              {user.stats.completed}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tasks completed this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setErrors({});
            if (previewAvatar) {
              URL.revokeObjectURL(previewAvatar);
              setPreviewAvatar(null);
            }
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage
                  src={previewAvatar || user.avatar}
                  alt={user.name}
                />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex gap-2">
                <Label
                  htmlFor="avatar-upload"
                  className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-3 rounded-md text-sm font-medium flex items-center gap-1"
                >
                  <Upload className="h-4 w-4" />
                  Upload Avatar
                  <Input
                    id="avatar-upload"
                    name="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="sr-only"
                  />
                </Label>

                {previewAvatar && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAvatarPreview}
                    className="flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>

              {errors.avatar && (
                <p className="text-sm font-medium text-red-500">
                  {errors.avatar}
                </p>
              )}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name <span className="text-red-500">*</span>
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={() => {
                    if (!formData.name.trim()) {
                      setErrors({
                        ...errors,
                        name: "Name is required",
                      });
                    }
                  }}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm font-medium text-red-500">
                    {errors.name}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role <span className="text-red-500">*</span>
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  onBlur={() => {
                    if (!formData.role.trim()) {
                      setErrors({
                        ...errors,
                        role: "Role is required",
                      });
                    }
                  }}
                  className={errors.role ? "border-red-500" : ""}
                />
                {errors.role && (
                  <p className="text-sm font-medium text-red-500">
                    {errors.role}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email <span className="text-red-500">*</span>
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={() => {
                    if (!formData.email.trim()) {
                      setErrors({
                        ...errors,
                        email: "Email is required",
                      });
                    }
                  }}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm font-medium text-red-500">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="skills" className="text-right">
                Skills
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  className={errors.skills ? "border-red-500" : ""}
                  placeholder="Comma-separated skills"
                />
                {errors.skills && (
                  <p className="text-sm font-medium text-red-500">
                    {errors.skills}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleEditProfile}
              disabled={!formData.name.trim() || !formData.role.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserProfile;
