import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ProductImagePickerProps {
  imageUrl?: string;
  onPickImage: () => Promise<void>;
  onRemoveImage?: () => Promise<void>;
  editable?: boolean;
}

export const ProductImagePicker: React.FC<ProductImagePickerProps> = ({
  imageUrl,
  onPickImage,
  onRemoveImage,
  editable = true,
}) => {
  return (
    <View style={styles.imageContainer}>
      {imageUrl ? (
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          {editable && (
            <View style={styles.imageActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onPickImage}
              >
                <Ionicons name="pencil" size={20} color="#fff" />
              </TouchableOpacity>
              {onRemoveImage && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.removeButton]}
                  onPress={onRemoveImage}
                >
                  <Ionicons name="trash" size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      ) : (
        <TouchableOpacity
          style={styles.placeholderContainer}
          onPress={editable ? onPickImage : undefined}
        >
          <Ionicons name="image-outline" size={48} color="#94a3b8" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  imageWrapper: {
    width: 200,
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  actionButton: {
    backgroundColor: "#2563eb",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButton: {
    backgroundColor: "#ef4444",
  },
  placeholderContainer: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
});

export default ProductImagePicker;
