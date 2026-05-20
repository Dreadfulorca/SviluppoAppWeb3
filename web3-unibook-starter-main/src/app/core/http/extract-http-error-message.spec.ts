import { HttpErrorResponse } from '@angular/common/http';

import { extractHttpErrorMessage } from './extract-http-error-message';

describe('extractHttpErrorMessage', () => {
  it('returns the message from a JSON string payload', () => {
    const error = new HttpErrorResponse({
      error: '{"message":"Email gia in uso."}',
      status: 400,
      statusText: 'Bad Request',
    });

    expect(extractHttpErrorMessage(error, 'Fallback')).toBe('Email gia in uso.');
  });

  it('returns the message from an object payload', () => {
    const error = new HttpErrorResponse({
      error: { message: 'Credenziali non valide.' },
      status: 401,
      statusText: 'Unauthorized',
    });

    expect(extractHttpErrorMessage(error, 'Fallback')).toBe('Credenziali non valide.');
  });

  it('returns the raw string when the payload is plain text', () => {
    const error = new HttpErrorResponse({
      error: 'Gateway timeout',
      status: 504,
      statusText: 'Gateway Timeout',
    });

    expect(extractHttpErrorMessage(error, 'Fallback')).toBe('Gateway timeout');
  });

  it('returns the dedicated network message for status 0', () => {
    const error = new HttpErrorResponse({
      error: new ProgressEvent('error'),
      status: 0,
      statusText: 'Unknown Error',
    });

    expect(extractHttpErrorMessage(error, 'Fallback')).toBe('Impossibile raggiungere il backend.');
  });

  it('falls back when the error is not an HttpErrorResponse', () => {
    expect(extractHttpErrorMessage(new Error('boom'), 'Fallback')).toBe('Fallback');
  });
});
