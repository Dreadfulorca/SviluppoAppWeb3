import { HttpErrorResponse } from '@angular/common/http';

import { ErrorResponse } from '../api/models/api.types';

function isErrorResponse(value: unknown): value is ErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string'
  );
}

export function extractHttpErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  if (typeof error.error === 'string' && error.error.trim()) {
    try {
      const parsed = JSON.parse(error.error) as unknown;
      return isErrorResponse(parsed) ? parsed.message : fallback;
    } catch {
      return error.error;
    }
  }

  if (isErrorResponse(error.error)) {
    return error.error.message;
  }

  if (error.status === 0) {
    return 'Impossibile raggiungere il backend.';
  }

  return fallback;
}
