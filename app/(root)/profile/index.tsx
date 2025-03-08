// app/(root)/profile/index.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser, useLogout } from "../../../src/hooks/useAuth";
import * as ImagePicker from "expo-image-picker";
import UserProfileService from "@/src/services/UserProfileService";

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  businessName?: string;
  profilePicture?: string;
}

const UserProfileScreen = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { mutate: logoutUser } = useLogout(
    () => router.push("/(auth)/login"),
    () => Alert.alert("Logout Failed", "Please try again")
  );

  const [formData, setFormData] = useState<UserProfile>({
    id: 0,
    firstName: "",
    lastName: "",
    email: "",
    businessName: "",
    profilePicture: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch user profile data
  const { data: userProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      return await UserProfileService.getProfile();
    },
  });

  // Update user profile mutation
  const updateProfile = useMutation({
    mutationFn: async (userData: Partial<UserProfile>) => {
      return await UserProfileService.updateProfile(userData.id!, userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    },
    onError: (error: any) => {
      Alert.alert("Update Failed", error.message || "Failed to update profile");
    },
  });

  // Initialize form with user data
  useEffect(() => {
    if (userProfile) {
      setFormData({
        id: userProfile.id,
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        email: userProfile.email || "",
        businessName: userProfile.businessName || "",
        profilePicture: userProfile.profilePicture || "",
      });
    }
  }, [userProfile]);

  const handleSave = () => {
    if (!formData.firstName || !formData.email) {
      Alert.alert("Error", "First name and email are required");
      return;
    }

    updateProfile.mutate({
      id: formData.id,
      firstName: formData.firstName,
      lastName: formData.lastName,
    });
  };

  const handleCancel = () => {
    // Reset form to original user data
    if (userProfile) {
      setFormData({
        id: userProfile.id,
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        email: userProfile.email || "",
        businessName: userProfile.businessName || "",
        profilePicture: userProfile.profilePicture || "",
      });
    }
    setIsEditing(false);
  };

  const pickImage = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "You need to grant access to your photo library to change your profile picture."
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedImage = result.assets[0];
        setIsUploading(true);

        try {
          // Upload the image using our service
          const imageUrl = await UserProfileService.uploadProfilePicture(
            pickedImage.uri
          );

          // Update local state with the new image URL
          setFormData((prev) => ({
            ...prev,
            profilePicture: imageUrl,
          }));

          // Update profile in database
          if (userProfile && userProfile.id) {
            await UserProfileService.updateProfile(userProfile.id, {
              profilePicture: imageUrl,
            });

            // Refresh the profile data
            queryClient.invalidateQueries({ queryKey: ["user-profile"] });
            queryClient.invalidateQueries({ queryKey: ["user"] });

            Alert.alert("Success", "Profile picture updated successfully");
          }
        } catch (error: any) {
          console.error("Error uploading image:", error);
          Alert.alert(
            "Upload Failed",
            error.message || "Failed to upload profile picture"
          );
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error: any) {
      console.error("Error picking image:", error);
      Alert.alert("Error", error.message || "Failed to pick image");
      setIsUploading(false);
    }
  };

  if (isProfileLoading || !userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#0f172a" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Profile</Text>
            <View style={styles.headerRight} />
          </View>

          <View style={styles.profileSection}>
            <TouchableOpacity
              style={styles.profileImageContainer}
              onPress={isEditing ? pickImage : undefined}
              disabled={!isEditing || isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="large" color="#2563eb" />
              ) : formData.profilePicture ? (
                <Image
                  source={{ uri: formData.profilePicture }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileInitials}>
                  <Text style={styles.initialsText}>
                    {formData.firstName && formData.firstName.charAt(0)}
                    {formData.lastName && formData.lastName.charAt(0)}
                  </Text>
                </View>
              )}
              {isEditing && (
                <View style={styles.editOverlay}>
                  <Ionicons name="camera" size={20} color="#fff" />
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.profileName}>
              {formData.firstName} {formData.lastName}
            </Text>
            <Text style={styles.profileEmail}>{formData.email}</Text>

            {!isEditing && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="pencil" size={16} color="#fff" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.formSection}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.disabledInput]}
                value={formData.firstName}
                onChangeText={(text) =>
                  setFormData({ ...formData, firstName: text })
                }
                editable={isEditing}
                placeholder="Enter first name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.disabledInput]}
                value={formData.lastName}
                onChangeText={(text) =>
                  setFormData({ ...formData, lastName: text })
                }
                editable={isEditing}
                placeholder="Enter last name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={formData.email}
                editable={false}
                placeholder="Email cannot be changed"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Business Name (Optional)</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.disabledInput]}
                value={formData.businessName}
                onChangeText={(text) =>
                  setFormData({ ...formData, businessName: text })
                }
                editable={isEditing}
                placeholder="Enter business name"
              />
            </View>

            {isEditing && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={handleSave}
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.accountSection}>
            <Text style={styles.sectionTitle}>Account</Text>

            <TouchableOpacity
              style={styles.accountOption}
              onPress={() => router.push("/(root)/profile/change-password")}
            >
              <View style={styles.accountOptionIcon}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#334155"
                />
              </View>
              <Text style={styles.accountOptionText}>Change Password</Text>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.accountOption}>
              <View style={styles.accountOptionIcon}>
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color="#334155"
                />
              </View>
              <Text style={styles.accountOptionText}>Notifications</Text>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.accountOption}>
              <View style={styles.accountOptionIcon}>
                <Ionicons name="shield-outline" size={20} color="#334155" />
              </View>
              <Text style={styles.accountOptionText}>Privacy & Security</Text>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.accountOption, styles.logoutOption]}
              onPress={() => {
                Alert.alert("Logout", "Are you sure you want to logout?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Logout", onPress: () => logoutUser() },
                ]);
              }}
            >
              <View style={[styles.accountOptionIcon, styles.logoutIcon]}>
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              </View>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: StatusBar.currentHeight,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748b",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
  },
  headerRight: {
    width: 40,
  },
  backButton: {
    padding: 8,
  },
  profileSection: {
    backgroundColor: "#fff",
    paddingVertical: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  profileImageContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    marginBottom: 16,
    position: "relative",
    overflow: "hidden",
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  profileInitials: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  editOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 6,
    alignItems: "center",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: "#2563eb",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 8,
  },
  formSection: {
    padding: 16,
    backgroundColor: "#fff",
    marginVertical: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1e293b",
  },
  disabledInput: {
    backgroundColor: "#f1f5f9",
    color: "#64748b",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f1f5f9",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#64748b",
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#2563eb",
    marginLeft: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  accountSection: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 16,
  },
  accountOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  accountOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  accountOptionText: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
  },
  logoutOption: {
    marginTop: 8,
    borderBottomWidth: 0,
  },
  logoutIcon: {
    backgroundColor: "#fee2e2",
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    color: "#ef4444",
    fontWeight: "500",
  },
});

export default UserProfileScreen;
