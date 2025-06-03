/**
 * Data Transfer Object for user information as received from the API.
 */
export interface UserDTO {
  role: string;
  custId: string;
  email: string;
  identificationNo: string;
  contactNo: string;
  fullName: string;
}

/**
 * Request payload for the login API endpoint.
 * POST - {{base_url}}/auth/login
 */
export interface LoginRequestDTO {
  username: string; // Corresponds to the email
  password: string;
  userType: "customer" | "admin" | string;
}

/**
 * Structure for the 'result' object in successful login or token refresh API responses.
 * Updated to remove tokenType and expiresIn as per backend response.
 */
export interface AuthTokenResultDTO {
  accessToken: string;
  refreshToken: string;
  // tokenType: string; // Removed as per backend response
  // expiresIn: number;  // Removed as per backend response
  user: UserDTO;
}

/**
 * Overall structure for a successful login API response.
 */
export interface LoginResponseDTO {
  respCode: number;
  respDesc: string;
  result: AuthTokenResultDTO;
}

/**
 * Request payload for the refresh token API endpoint.
 * Assuming POST {{base_url}}/auth/refresh (or similar)
 */
export interface RefreshTokenRequestDTO {
  refreshToken: string;
}

/**
 * Overall structure for a successful token refresh API response.
 * This reuses AuthTokenResultDTO which has been updated.
 */
export type RefreshTokenResponseDTO = LoginResponseDTO;


/**
 * Structure for the 'result' object in the token validation API response.
 * GET - {{base_url}}/auth/validate
 */
export interface ValidateTokenResultDTO {
  valid: boolean;
  // user?: UserDTO; // Kept commented out, as /auth/validate might not return user
}

/**
 * Overall structure for the token validation API response.
 */
export interface ValidateTokenResponseDTO {
  respCode: number;
  respDesc: string;
  result: ValidateTokenResultDTO;
}

/**
 * A generic structure for API error responses.
 */
export interface ApiErrorDTO {
  respCode: number;
  respDesc: string;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}
