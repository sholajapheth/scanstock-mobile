// src/screens/MyReceiptsScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as IntentLauncher from "expo-intent-launcher";
import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";

interface ReceiptFile {
  uri: string;
  name: string;
  date: Date;
  size: number;
}

const MyReceiptsScreen = () => {
  const [receipts, setReceipts] = useState<ReceiptFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadReceipts();
    }
  }, [isFocused]);

  const loadReceipts = async () => {
    try {
      setIsLoading(true);

      // Get all files in the document directory
      const receiptDir = FileSystem.documentDirectory || "";
      const fileList = await FileSystem.readDirectoryAsync(receiptDir);

      // Filter to only get receipt files
      const receiptFiles = fileList.filter(
        (filename) =>
          filename.startsWith("receipt_") && filename.endsWith(".pdf")
      );

      // Get info for each receipt file
      const receiptInfoPromises = receiptFiles.map(async (filename) => {
        const fileUri = receiptDir + filename;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);

        // Extract timestamp from filename (receipt_1709845362158.pdf)
        const timestamp = filename.replace("receipt_", "").replace(".pdf", "");
        const date = new Date(parseInt(timestamp, 10));

        return {
          uri: fileUri,
          name: filename,
          date: date,
          size: fileInfo.size || 0,
        };
      });

      const receiptInfos = await Promise.all(receiptInfoPromises);

      // Sort by date (newest first)
      receiptInfos.sort((a, b) => b.date.getTime() - a.date.getTime());

      setReceipts(receiptInfos);
    } catch (error) {
      console.error("Error loading receipts:", error);
      Alert.alert("Error", "Failed to load receipts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewReceipt = async (receipt: ReceiptFile) => {
    try {
      if (Platform.OS === "ios") {
        // On iOS, we can simply share the file which will open in the PDF viewer
        await Sharing.shareAsync(receipt.uri, {
          UTI: "com.adobe.pdf",
          mimeType: "application/pdf",
        });
      } // In the handleViewReceipt function, replace the Android section with this:
      else if (Platform.OS === "android") {
        // Get the file name from the URI
        const fileUri = receipt.uri;

        // Create a content URI using FileProvider via expo-file-system
        const contentUri = await FileSystem.getContentUriAsync(fileUri);

        // Use the content URI with the intent launcher
        await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
          data: contentUri,
          flags: 1,
          type: "application/pdf",
        });
      }
    } catch (error) {
      console.error("Error viewing receipt:", error);
      Alert.alert("Error", "Failed to open receipt");
    }
  };

  const handleShareReceipt = async (receipt: ReceiptFile) => {
    try {
      await Sharing.shareAsync(receipt.uri, {
        mimeType: "application/pdf",
        dialogTitle: "Share Receipt",
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      console.error("Error sharing receipt:", error);
      Alert.alert("Error", "Failed to share receipt");
    }
  };

  const handleDeleteReceipt = async (receipt: ReceiptFile) => {
    Alert.alert(
      "Delete Receipt",
      "Are you sure you want to delete this receipt?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await FileSystem.deleteAsync(receipt.uri);
              setReceipts(receipts.filter((r) => r.uri !== receipt.uri));
            } catch (error) {
              console.error("Error deleting receipt:", error);
              Alert.alert("Error", "Failed to delete receipt");
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const renderReceiptItem = ({ item }: { item: ReceiptFile }) => (
    <View style={styles.receiptItem}>
      <TouchableOpacity
        style={styles.receiptInfo}
        onPress={() => handleViewReceipt(item)}
      >
        <Ionicons
          name="document-text"
          size={24}
          color="#2563eb"
          style={styles.receiptIcon}
        />
        <View style={styles.receiptDetails}>
          <Text style={styles.receiptDate}>{formatDate(item.date)}</Text>
          <Text style={styles.receiptSize}>{formatFileSize(item.size)}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.receiptActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleShareReceipt(item)}
        >
          <Ionicons name="share-outline" size={20} color="#64748b" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteReceipt(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#94a3b8" />
      <Text style={styles.emptyText}>No receipts found</Text>
      <Text style={styles.emptySubtext}>
        Receipts will appear here after you complete a checkout
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Receipts</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadReceipts}>
            <Ionicons name="refresh" size={24} color="#0f172a" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading receipts...</Text>
          </View>
        ) : (
          <FlatList
            data={receipts}
            keyExtractor={(item) => item.uri}
            renderItem={renderReceiptItem}
            ListEmptyComponent={renderEmptyList}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: 35,
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
  refreshButton: {
    padding: 8,
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
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  receiptItem: {
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
  receiptInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  receiptIcon: {
    marginRight: 12,
  },
  receiptDetails: {
    flex: 1,
  },
  receiptDate: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 4,
  },
  receiptSize: {
    fontSize: 14,
    color: "#64748b",
  },
  receiptActions: {
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
  },
});

export default MyReceiptsScreen;
