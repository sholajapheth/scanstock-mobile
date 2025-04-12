// app/(root)/management/business.tsx
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
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Modal,
  FlatList,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  useBusiness,
  useCreateBusiness,
  useUpdateBusiness,
  BusinessData,
} from "@/src/hooks/useBusiness";
import { BUSINESS_CATEGORIES } from "@/constants/businessCategories";
import { COUNTRIES } from "@/constants/countries";
import { STATES, State } from "@/constants/states";
import { useUser } from "@/src/hooks/useAuth";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { pickAndUploadImage } from "@/src/utils/supabase-storage-utils";

export default function BusinessProfileScreen() {
  const router = useRouter();
  const {
    data: business,
    isLoading: isLoadingBusiness,
    isError,
    error,
  } = useBusiness();
  const createBusinessMutation = useCreateBusiness();
  const { mutate: updateBusiness, isPending: isUpdating } = useUpdateBusiness();
  const { user } = useUser();
  const {
    profile,
    updateProfile,
    isUpdating: isUpdatingProfile,
    updateError,
  } = useUserProfile();

  const [formData, setFormData] = useState<BusinessData>({
    name: business?.name || "",
    address: business?.address || "",
    city: business?.city || "",
    state: business?.state || "",
    postalCode: business?.postalCode || "",
    country: business?.country || "",
    phoneNumber: business?.phoneNumber || "",
    website: business?.website || "",
    taxId: business?.taxId || "",
    description: business?.description || "",
    industry: business?.industry || "",
    customIndustry: business?.customIndustry || "",
    logo: business?.logo || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [filteredStates, setFilteredStates] = useState<State[]>([]);

  // Update form with business data when loaded
  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || "",
        address: business.address || "",
        city: business.city || "",
        state: business.state || "",
        postalCode: business.postalCode || "",
        country: business.country || "",
        phoneNumber: business.phoneNumber || "",
        website: business.website || "",
        taxId: business.taxId || "",
        description: business.description || "",
        industry: business.industry || "",
        customIndustry: business.customIndustry || "",
        logo: business.logo || "",
      });
    }
  }, [business]);

  // Filter states based on selected country
  useEffect(() => {
    if (formData.country) {
      const selectedCountry = COUNTRIES.find(
        (c) => c.code === formData.country
      );
      if (selectedCountry && selectedCountry.hasStates) {
        const countryStates = STATES.filter(
          (s) => s.countryCode === selectedCountry.code
        );
        setFilteredStates(countryStates);
      } else {
        setFilteredStates([]);
      }
    } else {
      setFilteredStates([]);
    }
  }, [formData.country]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Business name is required");
      return;
    }

    updateBusiness(formData, {
      onSuccess: () => {
        Alert.alert("Success", "Business profile updated successfully");
        router.back();
      },
      onError: (error) => {
        Alert.alert(
          "Error",
          error.message || "Failed to update business profile"
        );
      },
    });
  };

  const handleUploadLogo = async () => {
    try {
      const imageUrl = await pickAndUploadImage({
        bucket: "business-logos",
        fileType: "profile",
        userId: profile?.id,
      });
      if (imageUrl) {
        await updateBusiness({ logo: imageUrl });
        Alert.alert("Logo updated successfully");
      }
    } catch (error) {
      Alert.alert("Failed to upload logo");
    }
  };

  const getCountryName = (code?: string) => {
    if (!code) return "";
    const country = COUNTRIES.find((c) => c.code === code);
    return country ? country.name : "";
  };

  const getStateName = (code?: string, countryCode?: string) => {
    if (!code || !countryCode) return "";
    const countryStates = STATES.filter((s) => s.countryCode === countryCode);
    const state = countryStates.find((s) => s.code === code);
    return state ? state.name : "";
  };

  // Render category selection modal
  const renderCategoryModal = () => (
    <Modal
      visible={showCategoryModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCategoryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Business Category</Text>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={BUSINESS_CATEGORIES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setFormData({ ...formData, industry: item });
                  setShowCategoryModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{item}</Text>
                {formData.industry === item && (
                  <Ionicons name="checkmark" size={20} color="#2563eb" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  // Render country selection modal
  const renderCountryModal = () => (
    <Modal
      visible={showCountryModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCountryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <TouchableOpacity onPress={() => setShowCountryModal(false)}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={COUNTRIES}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setFormData({ ...formData, country: item.code, state: "" });
                  setShowCountryModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{item.name}</Text>
                {formData.country === item.code && (
                  <Ionicons name="checkmark" size={20} color="#2563eb" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  // Render state selection modal
  const renderStateModal = () => (
    <Modal
      visible={showStateModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowStateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select State</Text>
            <TouchableOpacity onPress={() => setShowStateModal(false)}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {filteredStates.length > 0 ? (
            <FlatList
              data={filteredStates}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setFormData({ ...formData, state: item.code });
                    setShowStateModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                  {formData.state === item.code && (
                    <Ionicons name="checkmark" size={20} color="#2563eb" />
                  )}
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={styles.emptyStates}>
              <Text style={styles.emptyText}>
                No states available for selected country
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  if (isLoadingBusiness) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading business profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {business ? "Edit Business Profile" : "Create Business Profile"}
          </Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isUpdating}
          >
            <Text style={styles.saveButtonText}>
              {isUpdating ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.formContainer}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <TouchableOpacity
                style={styles.logoContainer}
                onPress={handleUploadLogo}
                disabled={isLoading}
              >
                {formData.logo ? (
                  <Image
                    source={{ uri: formData.logo }}
                    style={styles.logoImage}
                  />
                ) : (
                  <View style={styles.logoPlaceholder}>
                    <Ionicons name="business" size={40} color="#00A651" />
                  </View>
                )}
                {isLoading && (
                  <View style={styles.uploadOverlay}>
                    <ActivityIndicator color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.logoText}>Tap to change logo</Text>
            </View>

            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Business Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                  placeholder="Enter your business name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Industry</Text>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setShowCategoryModal(true)}
                >
                  <Text style={styles.selectText}>
                    {formData.industry || "Select industry"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {formData.industry === "Other" && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Custom Industry</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.customIndustry}
                    onChangeText={(text) =>
                      setFormData({ ...formData, customIndustry: text })
                    }
                    placeholder="Enter your industry"
                  />
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                  placeholder="Describe your business"
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            {/* Contact Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phoneNumber}
                  onChangeText={(text) =>
                    setFormData({ ...formData, phoneNumber: text })
                  }
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Website</Text>
                <TextInput
                  style={styles.input}
                  value={formData.website}
                  onChangeText={(text) =>
                    setFormData({ ...formData, website: text })
                  }
                  placeholder="Enter website URL"
                  keyboardType="url"
                />
              </View>
            </View>

            {/* Address Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Address Information</Text>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={styles.input}
                  value={formData.address}
                  onChangeText={(text) =>
                    setFormData({ ...formData, address: text })
                  }
                  placeholder="Enter street address"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={styles.input}
                  value={formData.city}
                  onChangeText={(text) =>
                    setFormData({ ...formData, city: text })
                  }
                  placeholder="Enter city"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Country</Text>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setShowCountryModal(true)}
                >
                  <Text style={styles.selectText}>
                    {getCountryName(formData.country) || "Select country"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {formData.country && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>State/Province</Text>
                  <TouchableOpacity
                    style={styles.selectInput}
                    onPress={() => setShowStateModal(true)}
                  >
                    <Text style={styles.selectText}>
                      {getStateName(formData.state, formData.country) ||
                        "Select state"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>Postal Code</Text>
                <TextInput
                  style={styles.input}
                  value={formData.postalCode}
                  onChangeText={(text) =>
                    setFormData({ ...formData, postalCode: text })
                  }
                  placeholder="Enter postal code"
                />
              </View>
            </View>

            {/* Tax Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tax Information</Text>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Tax ID</Text>
                <TextInput
                  style={styles.input}
                  value={formData.taxId}
                  onChangeText={(text) =>
                    setFormData({ ...formData, taxId: text })
                  }
                  placeholder="Enter tax ID"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {renderCategoryModal()}
        {renderCountryModal()}
        {renderStateModal()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: StatusBar.currentHeight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#64748b",
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
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: "#00A651",
    fontSize: 16,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    overflow: "hidden",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  logoPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  uploadOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 14,
    color: "#6B7280",
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  selectInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  selectText: {
    fontSize: 16,
    color: "#1F2937",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalItemText: {
    fontSize: 16,
    color: "#1e293b",
  },
  emptyStates: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
  },
});
