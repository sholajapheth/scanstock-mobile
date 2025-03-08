// src/services/UserProfileService.ts
import apiClient from "../lib/api-client";

/**
 * Service for managing user profile data
 */
class UserProfileService {
  /**
   * Upload a profile picture to the server
   * @param uri Local URI of the image file
   * @returns Promise resolving to the URL of the uploaded image
   */
  async uploadProfilePicture(uri: string): Promise<string> {
    try {
      // Create a form data object to send the image
      const formData = new FormData();

      // Get the file name from the URI
      const fileName = uri.split("/").pop() || "profile.jpg";

      // Determine mime type
      const fileType = fileName.endsWith(".png") ? "image/png" : "image/jpeg";

      // Append the image to the form data
      // For React Native, we need to use this special format for file objects
      formData.append("image", {
        uri,
        name: fileName,
        type: fileType,
      } as any);

      // Send the request with the proper content type for multipart form data
      const response = await apiClient.post(
        "/users/profile-picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Return the URL of the uploaded image from the response
      return response.data.imageUrl;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      throw new Error("Failed to upload profile picture");
    }
  }

  /**
   * Get the current user's profile
   * @returns Promise resolving to the user profile data
   */
  async getProfile(): Promise<any> {
    try {
      const response = await apiClient.get("/users/me");
      return response.data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw new Error("Failed to fetch profile");
    }
  }

  /**
   * Update user profile information
   * @param userId User ID
   * @param userData Profile data to update
   * @returns Promise resolving to the updated user data
   */
  async updateProfile(userId: number, userData: any): Promise<any> {
    try {
      const { id, ...data } = userData;
      const response = await apiClient.patch(`/users/${userId}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating profile:", JSON.stringify(error));
      throw new Error("Failed to update profile");
    }
  }

  /**
   * Change user's password
   * @param data Object containing currentPassword and newPassword
   * @returns Promise resolving on successful password change
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<any> {
    try {
      const response = await apiClient.post("/users/change-password", data);
      return response.data;
    } catch (error) {
      console.error("Error changing password:", error);
      throw new Error("Failed to change password");
    }
  }
}

export default new UserProfileService();
