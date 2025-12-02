import { NextResponse } from "next/server"

export interface ApiErrorResponse {
  error: string
  code?: string
  details?: string
  retryAfter?: number
  timestamp?: string
}

export interface ApiSuccessResponse<T = any> {
  success: true
  data?: T
  message?: string
  timestamp?: string
  meta?: {
    total?: number
    page?: number
    limit?: number
  }
}

/**
 * Standardized error response format
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  options: {
    code?: string
    details?: string
    retryAfter?: number
  } = {}
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    error: message,
    timestamp: new Date().toISOString(),
  }

  if (options.code) {
    response.code = options.code
  }

  if (options.details) {
    response.details = options.details
  }

  if (options.retryAfter) {
    response.retryAfter = options.retryAfter
  }

  return NextResponse.json(response, { status })
}

/**
 * Standardized success response format
 */
export function createSuccessResponse<T>(
  data?: T,
  message?: string,
  status: number = 200,
  meta?: {
    total?: number
    page?: number
    limit?: number
  }
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    timestamp: new Date().toISOString(),
  }

  if (data !== undefined) {
    response.data = data
  }

  if (message) {
    response.message = message
  }

  if (meta) {
    response.meta = meta
  }

  return NextResponse.json(response, { status })
}

/**
 * Common error responses
 */
export const CommonErrors = {
  UNAUTHORIZED: () => createErrorResponse("Unauthorized", 401, { code: "UNAUTHORIZED" }),
  FORBIDDEN: () => createErrorResponse("Forbidden", 403, { code: "FORBIDDEN" }),
  NOT_FOUND: (resource: string = "Resource") => createErrorResponse(`${resource} not found`, 404, { code: "NOT_FOUND" }),
  VALIDATION_ERROR: (message: string) => createErrorResponse(message, 400, { code: "VALIDATION_ERROR" }),
  RATE_LIMITED: (retryAfter: number) => createErrorResponse("Too many requests", 429, { code: "RATE_LIMITED", retryAfter }),
  INTERNAL_ERROR: (message: string = "Internal server error") => createErrorResponse(message, 500, { code: "INTERNAL_ERROR" }),
  SERVICE_UNAVAILABLE: (message: string = "Service temporarily unavailable") => createErrorResponse(message, 503, { code: "SERVICE_UNAVAILABLE" }),
}
