import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useUserProfile, ProfileUpdateData } from "@/src/hooks/useUserProfile";
import { pickAndUploadImage } from "@/src/utils/supabase-storage-utils";
import { useUser } from "@/src/hooks/useAuth";

export default function EditProfileScreen() {
  const { user } = useUser();
  const {
    profile,
    isLoading,
    updateProfile,
    uploadPicture,
    isUpdating,
    isUploading,
  } = useUserProfile();

  const [formData, setFormData] = useState<ProfileUpdateData>({
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    businessName: profile?.businessName || "",
    profilePicture: profile?.profilePicture || "",
  });

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert("Error", "First and last name are required");
      return;
    }

    try {
      await updateProfile(formData);
      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleUploadPicture = async () => {
    try {
      const uploadedUrl = await pickAndUploadImage({
        fileType: "avatar",
        userId: user?.id,
      });

      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, profilePicture: uploadedUrl }));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload profile picture");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A651" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isUpdating}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleUploadPicture}>
            {formData.profilePicture ? (
              <Image
                source={{ uri: formData.profilePicture }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {formData.firstName?.[0]?.toUpperCase() || "U"}
                </Text>
              </View>
            )}
            <View style={styles.editIconContainer}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={formData.firstName}
            onChangeText={(text) =>
              setFormData({ ...formData, firstName: text })
            }
            placeholder="Enter first name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={formData.lastName}
            onChangeText={(text) =>
              setFormData({ ...formData, lastName: text })
            }
            placeholder="Enter last name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Business Name</Text>
          <TextInput
            style={styles.input}
            value={formData.businessName}
            onChangeText={(text) =>
              setFormData({ ...formData, businessName: text })
            }
            placeholder="Enter business name"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginTop: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  backButton: {
    padding: 8,
  },
  saveButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#00A651",
    borderRadius: 6,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  form: {
    padding: 16,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#00A651",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 36,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#00A651",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: "#1F2937",
  },
});
