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
import { Colors } from "../../constants/Colors";
import { formatCurrency } from "@/src/utils/format";
// Default colors using our color scheme
const defaultColors = {
  text: Colors.light.text,
  background: Colors.light.background,
  primary: Colors.light.primary,
  success: Colors.light.success,
  error: Colors.light.error,
  warning: Colors.light.warning,
  icon: Colors.light.icon,
} as const;

type ColorConfig = typeof defaultColors;

interface Action {
  text: string;
  onPress: () => void;
  closeOnPress?: boolean;
  icon?: string;
  primary?: boolean;
  destructive?: boolean;
}

interface ScannerModalProps {
  visible: boolean;
  title: string;
  message: string;
  productImage?: React.ReactNode;
  productName?: string | null;
  productPrice?: number | null;
  status?: "success" | "error" | "warning";
  actions?: Action[];
  onClose?: () => void;
  colors?: ColorConfig;
}

const defaultProps = {
  productImage: null,
  productName: null,
  productPrice: null,
  status: "success" as const,
  actions: [] as Action[],
  onClose: () => {},
  colors: defaultColors,
} as const;

/**
 * ScannerModal - A custom modal component to display product scan results
 * and provide action buttons instead of using the default Alert component
 */
const ScannerModal: React.FC<ScannerModalProps> = ({
  visible,
  title,
  message,
  productImage = defaultProps.productImage,
  productName = defaultProps.productName,
  productPrice = defaultProps.productPrice,
  status = defaultProps.status,
  actions = defaultProps.actions,
  onClose = defaultProps.onClose,
  colors = defaultProps.colors,
}) => {
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
          color: colors.success,
        };
      case "error":
        return {
          icon: "alert-circle",
          color: colors.error,
        };
      case "warning":
        return {
          icon: "warning",
          color: colors.warning,
        };
      default:
        return {
          icon: "information-circle",
          color: colors.primary,
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

  const renderActions = () => {
    const actionsList = actions || [];
    return (
      <View
        style={[
          styles.actionContainer,
          actionsList.length > 2
            ? styles.actionContainerVertical
            : styles.actionContainerHorizontal,
        ]}
      >
        {actionsList.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.actionButton,
              actionsList.length > 2
                ? styles.fullWidthButton
                : styles.flexButton,
              action.primary
                ? { backgroundColor: statusConfig.color }
                : { backgroundColor: "transparent" },
              action.destructive && styles.destructiveButton,
              actionsList.length === 2 && index === 0 && styles.marginRight,
              actionsList.length === 2 && index === 1 && styles.marginLeft,
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
                    ? colors.background
                    : action.destructive
                    ? colors.error
                    : colors.text
                }
                style={styles.actionIcon}
              />
            )}
            <Text
              style={[
                styles.actionButtonText,
                { color: action.primary ? colors.background : colors.text },
                action.destructive && { color: colors.error },
              ]}
            >
              {action.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

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
            {
              transform: [{ scale: modalScale }],
              opacity: modalOpacity,
              backgroundColor: colors.background,
            },
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
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

          {/* Product Info (if present) */}
          {productName && (
            <View
              style={[
                styles.productInfoContainer,
                { backgroundColor: `${colors.primary}10` },
              ]}
            >
              {/* Optional Product Image */}
              {productImage && (
                <View
                  style={[
                    styles.productImageContainer,
                    { backgroundColor: `${colors.primary}10` },
                  ]}
                >
                  {productImage}
                </View>
              )}

              <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: colors.text }]}>
                  {productName}
                </Text>
                {productPrice && (
                  <Text
                    style={[styles.productPrice, { color: colors.primary }]}
                  >
                    {formatCurrency(productPrice)}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Message */}
          {message && (
            <Text style={[styles.message, { color: colors.text }]}>
              {message}
            </Text>
          )}

          {/* Action Buttons */}
          {renderActions()}
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
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  productInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    width: "100%",
    borderRadius: 12,
    padding: 12,
  },
  productImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
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
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "600",
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
  destructiveButton: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fee2e2",
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
