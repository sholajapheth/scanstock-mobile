// src/components/modals/ReceiptActionModal.tsx
import React from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ReceiptActionModalProps {
  visible: boolean;
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
  isLoading: boolean;
}

const ReceiptActionModal: React.FC<ReceiptActionModalProps> = ({
  visible,
  onClose,
  onDownload,
  onShare,
  isLoading,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Receipt Ready</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <Text style={styles.message}>
            Your receipt is ready. Would you like to download it to your device
            or share it?
          </Text>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.downloadButton]}
              onPress={onDownload}
              disabled={isLoading}
            >
              <Ionicons name="download-outline" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Download</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={onShare}
              disabled={isLoading}
            >
              <Ionicons name="share-social-outline" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  closeButton: {
    padding: 4,
  },
  message: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 24,
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 6,
  },
  downloadButton: {
    backgroundColor: "#3b82f6",
  },
  shareButton: {
    backgroundColor: "#10b981",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 16,
    marginLeft: 8,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#64748b",
    fontSize: 16,
  },
});

export default ReceiptActionModal;
