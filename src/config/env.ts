
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PAYMENT_GATEWAY_BASE_URL = import.meta.env.VITE_PAYMENT_GATEWAY_BASE_URL; // Read the new variable

// Validate API_BASE_URL
if (!API_BASE_URL) {
  const errorMessage = "Error: VITE_API_BASE_URL is not defined in your .env file. Please ensure it is set.";
  console.error(errorMessage);
  if (import.meta.env.DEV) {
    throw new Error(errorMessage);
  }
}

// Validate PAYMENT_GATEWAY_BASE_URL
if (!PAYMENT_GATEWAY_BASE_URL) {
  const errorMessage = "Error: VITE_PAYMENT_GATEWAY_BASE_URL is not defined in your .env file. Please ensure it is set.";
  console.error(errorMessage);
  if (import.meta.env.DEV) {
    throw new Error(errorMessage);
  }
}

export const config = {
  apiBaseUrl: API_BASE_URL as string,
  paymentGatewayBaseUrl: PAYMENT_GATEWAY_BASE_URL as string, // Export the new variable
};
