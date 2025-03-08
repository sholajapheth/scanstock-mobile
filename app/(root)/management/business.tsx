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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  useBusiness,
  useCreateBusiness,
  useUpdateBusiness,
  BusinessData,
} from "@/src/hooks/useBusiness";
import { BUSINESS_CATEGORIES } from "@/constants/businessCategories";
import { COUNTRIES } from "@/constants/countries";
import { STATES, State } from "@/constants/states";

export default function BusinessProfileScreen() {
  const {
    data: business,
    isLoading: isLoadingBusiness,
    isError,
    error,
  } = useBusiness();
  const createBusinessMutation = useCreateBusiness();
  const updateBusinessMutation = useUpdateBusiness();

  const [formData, setFormData] = useState<
    BusinessData & { customIndustry?: string }
  >({
    name: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phoneNumber: "",
    website: "",
    taxId: "",
    description: "",
    industry: "",
    customIndustry: "",
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

    setIsLoading(true);

    try {
      const dataToSave = {
        ...formData,
        // If industry is "Other", we need to use the customIndustry value
        industry: formData.industry === "Other" ? "Other" : formData.industry,
      };

      if (business) {
        // Update existing business
        await updateBusinessMutation.mutateAsync(dataToSave);
        Alert.alert("Success", "Business profile updated successfully");
      } else {
        // Create new business
        await createBusinessMutation.mutateAsync(dataToSave);
        Alert.alert("Success", "Business profile created successfully");
      }
      router.back();
    } catch (error: any) {
      console.error("Error saving business profile:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to save business profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getCountryName = (code: string) => {
    const country = COUNTRIES.find((c) => c.code === code);
    return country ? country.name : code;
  };

  const getStateName = (code: string, countryCode: string) => {
    const state = STATES.find(
      (s) => s.code === code && s.countryCode === countryCode
    );
    return state ? state.name : code;
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
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.formContainer}>
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
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={formData.phoneNumber}
                onChangeText={(text) =>
                  setFormData({ ...formData, phoneNumber: text })
                }
                placeholder="Enter business phone number"
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
                placeholder="Enter your business website"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tax ID / Business Number</Text>
              <TextInput
                style={styles.input}
                value={formData.taxId}
                onChangeText={(text) =>
                  setFormData({ ...formData, taxId: text })
                }
                placeholder="Enter your tax ID or business number"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Business Category</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text
                  style={
                    formData.industry
                      ? styles.selectInputText
                      : styles.placeholderText
                  }
                >
                  {formData.industry || "Select business category"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {formData.industry === "Other" && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Custom Category</Text>
                <TextInput
                  style={styles.input}
                  value={formData.customIndustry}
                  onChangeText={(text) =>
                    setFormData({ ...formData, customIndustry: text })
                  }
                  placeholder="Enter your custom business category"
                />
              </View>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Address Information</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Street Address</Text>
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
                <Text
                  style={
                    formData.country
                      ? styles.selectInputText
                      : styles.placeholderText
                  }
                >
                  {formData.country
                    ? getCountryName(formData.country)
                    : "Select country"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {formData.country && filteredStates.length > 0 && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>State/Province</Text>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setShowStateModal(true)}
                >
                  <Text
                    style={
                      formData.state
                        ? styles.selectInputText
                        : styles.placeholderText
                    }
                  >
                    {formData.state
                      ? getStateName(formData.state, formData.country)
                      : "Select state/province"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
            )}

            {/* Only show text input for state if country doesn't have predefined states */}
            {formData.country && filteredStates.length === 0 && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>State/Province/Region</Text>
                <TextInput
                  style={styles.input}
                  value={formData.state}
                  onChangeText={(text) =>
                    setFormData({ ...formData, state: text })
                  }
                  placeholder="Enter state or region"
                />
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

            <View style={styles.formGroup}>
              <Text style={styles.label}>Business Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="Brief description of your business"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {business
                    ? "Update Business Profile"
                    : "Create Business Profile"}
                </Text>
              )}
            </TouchableOpacity>
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
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1e293b",
  },
  selectInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectInputText: {
    fontSize: 16,
    color: "#1e293b",
  },
  placeholderText: {
    fontSize: 16,
    color: "#a0aec0",
  },
  textArea: {
    minHeight: 100,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  saveButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 40,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
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
