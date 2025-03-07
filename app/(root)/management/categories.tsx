import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  CreateCategoryData,
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/src/hooks/useCategories";

export default function CategoriesScreen() {
  const { data: categories, isLoading, isError } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: "",
    description: "",
    color: "#2563eb", // Default color
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "", color: "#2563eb" });
    setModalVisible(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color || "#2563eb",
    });
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Category name is required");
      return;
    }

    if (editingCategory) {
      updateCategory.mutate(
        {
          id: editingCategory.id,
          data: formData,
        },
        {
          onSuccess: () => {
            setModalVisible(false);
            Alert.alert("Success", "Category updated successfully");
          },
          onError: (error) => {
            Alert.alert("Error", `Failed to update category: ${error.message}`);
          },
        }
      );
    } else {
      createCategory.mutate(formData, {
        onSuccess: () => {
          setModalVisible(false);
          Alert.alert("Success", "Category created successfully");
        },
        onError: (error) => {
          Alert.alert("Error", `Failed to create category: ${error.message}`);
        },
      });
    }
  };

  const handleDelete = (category) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteCategory.mutate(category.id, {
              onSuccess: () => {
                Alert.alert("Success", "Category deleted successfully");
              },
              onError: (error) => {
                Alert.alert(
                  "Error",
                  `Failed to delete category: ${error.message}`
                );
              },
            });
          },
        },
      ]
    );
  };

  const renderCategoryItem = ({ item }) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryInfo}>
        <View
          style={[
            styles.colorIndicator,
            { backgroundColor: item.color || "#2563eb" },
          ]}
        />
        <View>
          <Text style={styles.categoryName}>{item.name}</Text>
          {item.description ? (
            <Text style={styles.categoryDescription}>{item.description}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.categoryActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(item)}
        >
          <Ionicons name="pencil-outline" size={20} color="#64748b" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="pricetag-outline" size={64} color="#94a3b8" />
      <Text style={styles.emptyText}>No categories found</Text>
      <Text style={styles.emptySubtext}>
        Add categories to organize your products
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => openCreateModal()}
      >
        <Text style={styles.emptyButtonText}>Add Category</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load categories</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.reload()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => openCreateModal()}
        >
          <Ionicons name="add" size={24} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCategoryItem}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={styles.listContent}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCategory ? "Edit Category" : "New Category"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="Enter category name"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="Enter category description"
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Color</Text>
              <View style={styles.colorContainer}>
                {["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"].map(
                  (color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        {
                          backgroundColor: color,
                          borderWidth: formData.color === color ? 3 : 0,
                        },
                      ]}
                      onPress={() => setFormData({ ...formData, color })}
                    />
                  )
                )}
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={createCategory.isPending || updateCategory.isPending}
              >
                {createCategory.isPending || updateCategory.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: 30,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  backButton: {
    padding: 8,
  },
  addButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  categoryInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: "#64748b",
  },
  categoryActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#64748b",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#64748b",
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "#64748b",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1e293b",
  },
  textArea: {
    minHeight: 80,
  },
  colorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderColor: "#fff",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  cancelButtonText: {
    color: "#334155",
    fontWeight: "500",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#2563eb",
    minWidth: 80,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
});
