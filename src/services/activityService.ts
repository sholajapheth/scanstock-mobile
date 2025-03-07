// src/services/activityService.ts
import api from "../lib/api-client";
import { Logger } from "../utils/logger";

const log = new Logger("ActivityService");

export interface ActivityItem {
  id: number;
  type:
    | "sale"
    | "stock_increase"
    | "stock_decrease"
    | "product_added"
    | "product_updated";
  description: string;
  timestamp: string;
  entityId: number;
  entityType: "product" | "sale";
  entityName?: string;
  amount?: number;
  quantity?: number;
  userId: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

class ActivityService {
  async getRecentActivity(
    limit: number = 10
  ): Promise<ApiResponse<ActivityItem[]>> {
    log.info(`Fetching recent activity (limit: ${limit})`);
    return api.get(`/activities/recent?limit=${limit}`);
  }

  async getProductActivity(
    productId: number,
    limit: number = 10
  ): Promise<ApiResponse<ActivityItem[]>> {
    log.info(`Fetching activity for product ${productId} (limit: ${limit})`);
    return api.get(`/activities/product/${productId}?limit=${limit}`);
  }

  async getSaleActivity(
    saleId: number,
    limit: number = 10
  ): Promise<ApiResponse<ActivityItem[]>> {
    log.info(`Fetching activity for sale ${saleId} (limit: ${limit})`);
    return api.get(`/activities/sale/${saleId}?limit=${limit}`);
  }

  async getActivitiesByType(
    type: string,
    limit: number = 10
  ): Promise<ApiResponse<ActivityItem[]>> {
    log.info(`Fetching activities by type ${type} (limit: ${limit})`);
    return api.get(`/activities/type/${type}?limit=${limit}`);
  }

  // Mock function to generate sample activity data for testing
  getMockRecentActivity(limit: number = 10): ActivityItem[] {
    const activities: ActivityItem[] = [
      {
        id: 1,
        type: "sale",
        description: "Sold 2 units of Wireless Headphones",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        entityId: 101,
        entityType: "sale",
        entityName: "Wireless Headphones",
        amount: 89.98,
        quantity: 2,
        userId: 1,
      },
      {
        id: 2,
        type: "stock_decrease",
        description: "Adjusted inventory: -3 USB Cables",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        entityId: 203,
        entityType: "product",
        entityName: "USB Cables",
        quantity: 3,
        userId: 1,
      },
      {
        id: 3,
        type: "product_added",
        description: "Added new product: Smart Watch",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        entityId: 304,
        entityType: "product",
        entityName: "Smart Watch",
        userId: 1,
      },
      {
        id: 4,
        type: "sale",
        description: "Sold 1 unit of Bluetooth Speaker",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
        entityId: 102,
        entityType: "sale",
        entityName: "Bluetooth Speaker",
        amount: 49.99,
        quantity: 1,
        userId: 1,
      },
      {
        id: 5,
        type: "stock_increase",
        description: "Restocked: +10 Phone Cases",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
        entityId: 205,
        entityType: "product",
        entityName: "Phone Cases",
        quantity: 10,
        userId: 1,
      },
      {
        id: 6,
        type: "product_updated",
        description: "Updated product: External Hard Drive",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        entityId: 306,
        entityType: "product",
        entityName: "External Hard Drive",
        userId: 1,
      },
      {
        id: 7,
        type: "sale",
        description: "Sold 3 units of HDMI Cables",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // 26 hours ago
        entityId: 103,
        entityType: "sale",
        entityName: "HDMI Cables",
        amount: 29.97,
        quantity: 3,
        userId: 1,
      },
      {
        id: 8,
        type: "product_added",
        description: "Added new product: Wireless Charger",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 32).toISOString(), // 32 hours ago
        entityId: 307,
        entityType: "product",
        entityName: "Wireless Charger",
        userId: 1,
      },
      {
        id: 9,
        type: "stock_decrease",
        description: "Adjusted inventory: -2 Power Banks",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        entityId: 208,
        entityType: "product",
        entityName: "Power Banks",
        quantity: 2,
        userId: 1,
      },
      {
        id: 10,
        type: "sale",
        description: "Sold 1 unit of Laptop Sleeve",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(), // 50 hours ago
        entityId: 104,
        entityType: "sale",
        entityName: "Laptop Sleeve",
        amount: 19.99,
        quantity: 1,
        userId: 1,
      },
    ];

    return activities.slice(0, limit);
  }
}

export const logReceiptActivity = async (
  type: "receipt_generated" | "receipt_downloaded",
  receiptId: string,
  description: string,
  metadata?: Record<string, any>
) => {
  try {
    // You would normally call your API here
    // For now, we'll just log to console
    console.log("Receipt activity logged:", {
      type,
      receiptId,
      description,
      metadata,
    });

    // Return a mock success response
    return {
      success: true,
      message: "Activity logged successfully",
    };
  } catch (error) {
    console.error("Error logging receipt activity:", error);
    return {
      success: false,
      message: "Failed to log activity",
    };
  }
};

export const activityService = new ActivityService();
export default activityService;
