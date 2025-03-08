// src/utils/FileUtils.ts
import * as FileSystem from "expo-file-system";

/**
 * Utility functions for working with files in React Native/Expo
 */
export class FileUtils {
  /**
   * Convert a local URI to a blob for upload
   * This is necessary because React Native doesn't have native File and Blob objects
   *
   * @param uri The local URI of the file
   * @returns A promise that resolves to a Blob object
   */
  static async uriToBlob(uri: string): Promise<Blob> {
    // For Expo FileSystem URIs
    if (uri.startsWith("file://") || uri.startsWith("content://")) {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error(`File does not exist at ${uri}`);
      }

      // Read the file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to blob
      return this.base64ToBlob(base64, this.getMimeTypeFromUri(uri));
    }

    // For remote URIs or any other case, use fetch
    const response = await fetch(uri);
    return await response.blob();
  }

  /**
   * Convert a base64 string to a Blob
   *
   * @param base64 The base64 string
   * @param mimeType The MIME type of the file
   * @returns A Blob object
   */
  static base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mimeType });
  }

  /**
   * Get the MIME type from a file URI
   *
   * @param uri The file URI
   * @returns The MIME type string
   */
  static getMimeTypeFromUri(uri: string): string {
    const extension = uri.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "gif":
        return "image/gif";
      case "pdf":
        return "application/pdf";
      case "doc":
        return "application/msword";
      case "docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      case "xls":
        return "application/vnd.ms-excel";
      case "xlsx":
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      default:
        return "application/octet-stream";
    }
  }
}

export default FileUtils;
