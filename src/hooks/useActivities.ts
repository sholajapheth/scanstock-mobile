// src/hooks/useActivities.ts
import { useQuery } from "@tanstack/react-query";
import activityService, { ActivityItem } from "../services/activityService";
import { Logger } from "../utils/logger";

const log = new Logger("useActivities");

interface UseActivitiesOptions {
  limit?: number;
  productId?: number;
  useMockData?: boolean; // For development before API is ready
  enabled?: boolean;
}

export function useActivities(options: UseActivitiesOptions = {}) {
  const {
    limit = 10,
    productId,
    useMockData = false, // Changed to false to use real API
    enabled = true,
  } = options;

  // Fetch activities using TanStack Query
  const {
    data: activities = [],
    isLoading,
    isError,
    error,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["activities", productId, limit],
    queryFn: async () => {
      log.debug(
        `Fetching ${limit} activities${
          productId ? ` for product ${productId}` : ""
        }`
      );

      if (useMockData) {
        // Use mock data for development/demo
        const mockData = activityService.getMockRecentActivity(limit);
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        return mockData;
      }

      // Use real API data
      try {
        let result;
        if (productId) {
          result = await activityService.getProductActivity(productId, limit);
        } else {
          result = await activityService.getRecentActivity(limit);
        }

        if (!result.data) {
          throw new Error(result.message || "Failed to fetch activities");
        }

        return result.data || [];
      } catch (err) {
        log.error("Failed to fetch activities:", err);
        // Fall back to mock data on error if needed
        if (process.env.NODE_ENV !== "production") {
          log.info("Falling back to mock data");
          return activityService.getMockRecentActivity(limit);
        }
        throw err;
      }
    },
    enabled,
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // 5 minutes
  });

  // Format relative time (e.g., "2 hours ago")
  const getRelativeTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return "just now";
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    } else if (diffDays < 30) {
      return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    } else {
      // Format as date for older items
      return date.toLocaleDateString();
    }
  };

  return {
    activities,
    isLoading,
    isError,
    error: isError
      ? error instanceof Error
        ? error.message
        : "Unknown error"
      : null,
    lastRefreshed: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    refresh: refetch,
    getRelativeTime,
  };
}
