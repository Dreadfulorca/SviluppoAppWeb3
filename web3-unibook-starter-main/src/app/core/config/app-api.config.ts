import { environment } from '../../../environments/environment';

export const appApiConfig = {
  functionsBaseUrl: environment.api.functionsBaseUrl,
  apikey: environment.api.apikey,
} as const;
