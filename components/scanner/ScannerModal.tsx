import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ScannerModalProps {
  visible: boolean;
  title: string;
  message: string;
  productImage: React.ReactNode;
  productName: string | null;
  productPrice: string | null;
  status: "success" | "error" | "warning";
  actions: {
    text: string;
    onPress: () => void;
    closeOnPress?: boolean;
    icon?: string;
    primary?: boolean;
    destructive?: boolean;
  }[];
  onClose: () => void;
}
/**
 * ScannerModal - A custom modal component to display product scan results
 * and provide action buttons instead of using the default Alert component
 */
const ScannerModal = ({
  visible,
  title,
  message,
  productImage = null,
  productName = null,
  productPrice = null,
  status = "success", // success, error, warning
  actions = [],
  onClose,
}: ScannerModalProps) => {
  // Animation value for modal appearance
  const [animation] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(animation, {
        toValue: 1,
        tension: 70,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, animation]);

  // Status icon and color
  const getStatusConfig = () => {
    switch (status) {
      case "success":
        return {
          icon: "checkmark-circle",
          color: "#10b981", // green
        };
      case "error":
        return {
          icon: "alert-circle",
          color: "#ef4444", // red
        };
      case "warning":
        return {
          icon: "warning",
          color: "#f59e0b", // amber
        };
      default:
        return {
          icon: "information-circle",
          color: "#3b82f6", // blue
        };
    }
  };

  const statusConfig = getStatusConfig();

  const modalScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const modalOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ scale: modalScale }], opacity: modalOpacity },
          ]}
        >
          {/* Status Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${statusConfig.color}20` },
            ]}
          >
            <Ionicons
              name={statusConfig.icon as any}
              size={36}
              color={statusConfig.color}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Product Info (if present) */}
          {productName && (
            <View style={styles.productInfoContainer}>
              {/* Optional Product Image */}
              {productImage && (
                <View style={styles.productImageContainer}>{productImage}</View>
              )}

              <View style={styles.productInfo}>
                <Text style={styles.productName}>{productName}</Text>
                {productPrice && (
                  <Text style={styles.productPrice}>${productPrice}</Text>
                )}
              </View>
            </View>
          )}

          {/* Message */}
          {message && <Text style={styles.message}>{message}</Text>}

          {/* Action Buttons */}
          <View
            style={[
              styles.actionContainer,
              actions.length > 2
                ? styles.actionContainerVertical
                : styles.actionContainerHorizontal,
            ]}
          >
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.actionButton,
                  actions.length > 2
                    ? styles.fullWidthButton
                    : styles.flexButton,
                  action.primary
                    ? styles.primaryButton
                    : styles.secondaryButton,
                  action.destructive && styles.destructiveButton,
                  actions.length === 2 && index === 0 && styles.marginRight,
                  actions.length === 2 && index === 1 && styles.marginLeft,
                ]}
                onPress={() => {
                  action.onPress();
                  if (action.closeOnPress !== false) {
                    onClose();
                  }
                }}
              >
                {action.icon && (
                  <Ionicons
                    name={action.icon as any}
                    size={18}
                    color={
                      action.primary
                        ? "#fff"
                        : action.destructive
                        ? "#ef4444"
                        : "#64748b"
                    }
                    style={styles.actionIcon}
                  />
                )}
                <Text
                  style={[
                    styles.actionButtonText,
                    action.primary
                      ? styles.primaryButtonText
                      : styles.secondaryButtonText,
                    action.destructive && styles.destructiveButtonText,
                  ]}
                >
                  {action.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width - 40,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  productInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
  },
  productImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2563eb",
  },
  actionContainer: {
    width: "100%",
    marginTop: 8,
  },
  actionContainerHorizontal: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionContainerVertical: {
    flexDirection: "column",
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginVertical: 4,
  },
  fullWidthButton: {
    width: "100%",
  },
  flexButton: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: "#2563eb",
  },
  secondaryButton: {
    backgroundColor: "#f1f5f9",
  },
  destructiveButton: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fee2e2",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButtonText: {
    color: "#64748b",
    fontWeight: "500",
    fontSize: 16,
  },
  destructiveButtonText: {
    color: "#ef4444",
    fontWeight: "600",
  },
  marginRight: {
    marginRight: 6,
  },
  marginLeft: {
    marginLeft: 6,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ScannerModal;
