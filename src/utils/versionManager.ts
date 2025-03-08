import * as Updates from "expo-updates";
import { Alert, Linking, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Define version related constants
const APP_VERSION = Constants.expoConfig?.version || "1.0.0";
const BUILD_NUMBER =
  Constants.expoConfig?.ios?.buildNumber ||
  Constants.expoConfig?.android?.versionCode ||
  "1";

// Store keys
const LAST_UPDATE_CHECK_KEY = "last_update_check";
const POSTPONED_UPDATE_KEY = "postponed_update";

interface UpdateConfig {
  minVersion: string;
  latestVersion: string;
  updateUrl: string;
  releaseNotes: string;
  forceUpdate: boolean;
}

/**
 * Check if a native app update is required
 * This checks the installed app version against the minimum required version
 */
export const checkForRequiredUpdate = async (): Promise<void> => {
  try {
    // Fetch the update configuration from your server
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/app-updates/latest`
    );
    const updateConfig: UpdateConfig = await response.json();

    // Compare versions
    const needsUpdate =
      compareVersions(APP_VERSION, updateConfig.minVersion) < 0;

    if (needsUpdate) {
      // If update is required, show a non-dismissible alert
      Alert.alert(
        "Update Required",
        `Please update to the latest version (${updateConfig.latestVersion}) to continue using the app.\n\n${updateConfig.releaseNotes}`,
        [
          {
            text: "Update Now",
            onPress: () => {
              // Open the appropriate store
              Linking.openURL(updateConfig.updateUrl);
            },
          },
        ],
        { cancelable: false }
      );
    } else if (updateConfig.latestVersion !== APP_VERSION) {
      // If there's an optional update available
      const lastPostponed = await AsyncStorage.getItem(POSTPONED_UPDATE_KEY);

      if (lastPostponed !== updateConfig.latestVersion) {
        Alert.alert(
          "Update Available",
          `A new version (${updateConfig.latestVersion}) is available.\n\n${updateConfig.releaseNotes}`,
          [
            {
              text: "Update Now",
              onPress: () => Linking.openURL(updateConfig.updateUrl),
            },
            {
              text: "Later",
              onPress: () => {
                // Store that user postponed this specific version
                AsyncStorage.setItem(
                  POSTPONED_UPDATE_KEY,
                  updateConfig.latestVersion
                );
              },
              style: "cancel",
            },
          ]
        );
      }
    }

    // Store last check time
    await AsyncStorage.setItem(LAST_UPDATE_CHECK_KEY, Date.now().toString());
  } catch (error) {
    console.error("Error checking for app update:", error);
  }
};

/**
 * Check for and download OTA updates using Expo Updates
 */
export const checkForOTAUpdate = async (force = false): Promise<void> => {
  try {
    // Don't check too frequently
    const lastCheck = await AsyncStorage.getItem(LAST_UPDATE_CHECK_KEY);
    const now = Date.now();

    if (
      !force &&
      lastCheck &&
      now - parseInt(lastCheck) < 24 * 60 * 60 * 1000
    ) {
      // Only check once per day unless forced
      return;
    }

    // Check if an update is available
    const update = await Updates.checkForUpdateAsync();

    if (update.isAvailable) {
      // Download the update
      await Updates.fetchUpdateAsync();

      // Ask user if they want to restart to apply the update
      Alert.alert(
        "Update Downloaded",
        "An update has been downloaded. Would you like to restart the app to apply it?",
        [
          {
            text: "Later",
            style: "cancel",
          },
          {
            text: "Restart Now",
            onPress: () => Updates.reloadAsync(),
          },
        ]
      );
    }

    await AsyncStorage.setItem(LAST_UPDATE_CHECK_KEY, now.toString());
  } catch (error) {
    console.error("Error checking for OTA update:", error);
  }
};

/**
 * Helper function to compare semantic versions
 * Returns:
 * - negative if v1 < v2
 * - positive if v1 > v2
 * - zero if v1 = v2
 */
const compareVersions = (v1: string, v2: string): number => {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = i < parts1.length ? parts1[i] : 0;
    const part2 = i < parts2.length ? parts2[i] : 0;

    if (part1 < part2) return -1;
    if (part1 > part2) return 1;
  }

  return 0;
};

/**
 * Get app version information
 */
export const getAppVersion = (): { version: string; buildNumber: string } => {
  return {
    version: APP_VERSION,
    buildNumber: BUILD_NUMBER.toString(),
  };
};
