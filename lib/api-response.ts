/**
 * Standardized API response helpers
 * Ensures consistent response format across all API routes
 */

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  requestId: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  requestId: string;
  timestamp: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a standardized success response
 */
export function successResponse<T>(
  data: T,
  requestId: string
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    requestId,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a standardized error response
 * Never includes debug info or stack traces in production
 */
export function errorResponse(
  message: string,
  requestId: string
): ApiErrorResponse {
  return {
    success: false,
    error: message,
    requestId,
    timestamp: new Date().toISOString(),
  };
}
