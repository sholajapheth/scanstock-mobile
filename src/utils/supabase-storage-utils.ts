import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase-config";
import { Alert } from "react-native";

// Utility type for upload options
interface UploadOptions {
  bucket?: string;
  fileType?: "product" | "profile";
  userId?: number;
}

export const uploadToSupabase = async (
  uri: string,
  options: UploadOptions = {}
) => {
  try {
    // Validate input
    if (!uri) {
      throw new Error("No file URI provided");
    }

    // Extract file extension
    const extension = uri.split(".").pop();

    // Generate unique filename
    const filename = `${options.fileType || "file"}_${Date.now()}.${extension}`;

    // Construct path based on options
    const path = options.userId
      ? `${options.fileType || "uploads"}/${options.userId}/${filename}`
      : `${options.fileType || "uploads"}/${filename}`;

    // Convert image to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from(options.bucket || "public")
      .upload(path, blob, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(options.bucket || "public").getPublicUrl(path);

    return publicUrl;
  } catch (error) {
    console.error("Supabase upload error:", error);
    Alert.alert("Upload Failed", "Unable to upload file");
    return null;
  }
};

export const pickAndUploadImage = async (options: UploadOptions = {}) => {
  try {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Needed",
        "Sorry, we need camera roll permissions to upload images"
      );
      return null;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: false,
    });

    // Check if user selected an image
    if (result.canceled) return null;

    // Upload selected image
    const uploadedUrl = await uploadToSupabase(result.assets[0].uri, options);

    return uploadedUrl;
  } catch (error) {
    console.error("Image pick and upload error:", error);
    Alert.alert("Error", "Failed to pick and upload image");
    return null;
  }
};

export const deleteSupabaseFile = async (
  fileUrl: string,
  bucket = "public"
) => {
  try {
    // Extract path from URL
    const path = fileUrl.split(`${bucket}/`).pop();

    if (!path) {
      throw new Error("Invalid file URL");
    }

    // Delete from Supabase storage
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Supabase file delete error:", error);
    Alert.alert("Delete Failed", "Unable to delete file");
    return false;
  }
};
