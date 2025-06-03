// src/lib/imageUtils.ts

// Retrieve the base URL for images from environment variables.
// Fallback to a placeholder service if not defined, which is good for development.
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || "https://placehold.co";

/**
 * Constructs the full URL for a ticket group image.
 * If uniqueExtension starts with '/', it's treated as an absolute public path.
 * Otherwise, it constructs the URL using the IMAGE_BASE_URL.
 *
 * @param uniqueExtension - The unique extension, filename, partial path, or absolute public path for the image.
 * @param groupName - The name of the ticket group, used for placeholder text if the image is missing.
 * @returns The full image URL.
 */
export const getTicketGroupImageUrl = (uniqueExtension: string | undefined, groupName: string = "Event Image"): string => {
  // Check if uniqueExtension is an absolute path (e.g., for hardcoded public images)
  if (uniqueExtension && uniqueExtension.startsWith('/')) {
    return uniqueExtension; // Use the path directly
  }

  // Check if uniqueExtension is provided for API images, not "x" (dummy value), and not empty.
  if (uniqueExtension && uniqueExtension.toLowerCase() !== "x" && uniqueExtension.trim() !== "") {
    const baseUrl = IMAGE_BASE_URL.endsWith('/') ? IMAGE_BASE_URL.slice(0, -1) : IMAGE_BASE_URL;
    // For API images, uniqueExtension is usually just a filename or a relative path from the base.
    // We don't want to remove a leading slash here if IMAGE_BASE_URL itself might be just a domain.
    // The original logic for API images should be fine.
    const imagePath = uniqueExtension; // Assuming uniqueExtension is correctly formatted from API
    return `${baseUrl}/${imagePath}`;
  }

  // Fallback to a placeholder image.
  const encodedGroupName = encodeURIComponent(groupName);
  const placeholderBgColor = "CCCCCC"; // Light gray
  const placeholderTextColor = "555555"; // Dark gray
  // Ensure placeholder URL is correctly formed if IMAGE_BASE_URL is placehold.co
  if (IMAGE_BASE_URL.includes("placehold.co")) {
     return `https://placehold.co/600x400/${placeholderBgColor}/${placeholderTextColor}?text=${encodedGroupName}&font=inter`;
  }
  // If IMAGE_BASE_URL is something else, this might need adjustment or a different placeholder strategy
  return `${IMAGE_BASE_URL}/placeholder/600x400/${placeholderBgColor}/${placeholderTextColor}?text=${encodedGroupName}`;
};
