// src/hooks/useUserProfile.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api-client";

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  businessName?: string;
  profilePicture?: string;
  isActive: boolean;
}

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  businessName?: string;
  profilePicture?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

// Fetch the user profile
const fetchUserProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get("/users/me");
  return response.data;
};

// Update the user profile
const updateUserProfile = async ({
  userId,
  data,
}: {
  userId: number;
  data: ProfileUpdateData;
}): Promise<UserProfile> => {
  const response = await apiClient.patch(`/users/${userId}`, data);
  return response.data;
};

// Change the user's password
const changePassword = async (
  data: PasswordChangeData
): Promise<{ message: string }> => {
  const response = await apiClient.post("/users/change-password", data);
  return response.data;
};

// Upload profile picture
const uploadProfilePicture = async (
  file: FormData
): Promise<{ url: string; message: string }> => {
  const response = await apiClient.post("/users/upload-avatar", file, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Hook for user profile operations
export function useUserProfile() {
  const queryClient = useQueryClient();

  // Get user profile query
  const profileQuery = useQuery({
    queryKey: ["user-profile"],
    queryFn: fetchUserProfile,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      // Invalidate and refetch user profile and user data
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  // Password change mutation
  const passwordChangeMutation = useMutation({
    mutationFn: changePassword,
  });

  // Profile picture upload mutation
  const uploadPictureMutation = useMutation({
    mutationFn: uploadProfilePicture,
    onSuccess: (data) => {
      // Update the user profile with the new image URL
      if (profileQuery.data) {
        updateProfileMutation.mutate({
          userId: profileQuery.data.id,
          data: { profilePicture: data.url },
        });
      }
    },
  });

  return {
    // Queries
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,

    // Mutations
    updateProfile: (data: ProfileUpdateData) => {
      if (!profileQuery.data) {
        throw new Error("User profile not loaded");
      }
      return updateProfileMutation.mutate({
        userId: profileQuery.data.id,
        data,
      });
    },
    isUpdating: updateProfileMutation.isPending,
    updateError: updateProfileMutation.error,

    // Password change
    changePassword: passwordChangeMutation.mutate,
    isChangingPassword: passwordChangeMutation.isPending,
    passwordChangeError: passwordChangeMutation.error,

    // Profile picture upload
    uploadPicture: uploadPictureMutation.mutate,
    isUploading: uploadPictureMutation.isPending,
    uploadError: uploadPictureMutation.error,

    // Refresh
    refetch: profileQuery.refetch,
  };
}
