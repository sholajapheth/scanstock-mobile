// src/utils/logger.ts
import { Platform } from "react-native";

type LogLevel = "debug" | "info" | "warn" | "error";

// Control which log levels are enabled
const ENABLED_LEVELS: Record<LogLevel, boolean> = {
  debug: __DEV__, // Only enabled in development
  info: true,
  warn: true,
  error: true,
};

// Optional tag to identify logs source
export class Logger {
  private tag: string;

  constructor(tag: string = "App") {
    this.tag = tag;
  }

  // Create a child logger with a sub-tag
  subLogger(subTag: string): Logger {
    return new Logger(`${this.tag}:${subTag}`);
  }

  // Generic log method
  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (!ENABLED_LEVELS[level]) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}][${this.tag}][${level.toUpperCase()}]`;

    // For web browsers
    if (Platform.OS === "web") {
      console[level](`${prefix} ${message}`, ...args);
      return;
    }

    // For native apps
    if (args.length > 0) {
      console[level](`${prefix} ${message}`, ...args);
    } else {
      console[level](`${prefix} ${message}`);
    }
  }

  debug(message: string, ...args: any[]): void {
    this.log("debug", message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log("info", message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log("warn", message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.log("error", message, ...args);
  }

  // Log network requests and responses for debugging API calls
  logRequest(method: string, url: string, data?: any): void {
    this.debug(`${method} Request to ${url}`, { body: data });
  }

  logResponse(method: string, url: string, status: number, data: any): void {
    this.debug(`${method} Response from ${url} (${status})`, { data });
  }

  logError(error: any, context: string = "unknown"): void {
    if (error.response) {
      // Server responded with an error code
      this.error(`API Error (${context}):`, {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // Request was made but no response received
      this.error(`Network Error (${context}):`, {
        request: error.request,
      });
    } else {
      // Something else happened in setting up the request
      this.error(`Request Setup Error (${context}):`, error.message);
    }
  }
}

// Create default logger instance
export const logger = new Logger();

// Create API logger
export const apiLogger = new Logger("API");

// Create custom axios instance with logging
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export const createApiClient = (baseURL: string = "") => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
  });

  // Request interceptor for logging
  instance.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      apiLogger.logRequest(
        config.method?.toUpperCase() || "UNKNOWN",
        `${config.baseURL}${config.url}`,
        config.data
      );
      return config;
    },
    (error) => {
      apiLogger.logError(error, "request");
      return Promise.reject(error);
    }
  );

  // Response interceptor for logging
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      apiLogger.logResponse(
        response.config.method?.toUpperCase() || "UNKNOWN",
        `${response.config.baseURL}${response.config.url}`,
        response.status,
        response.data
      );
      return response;
    },
    (error) => {
      apiLogger.logError(error, "response");
      return Promise.reject(error);
    }
  );

  return instance;
};
