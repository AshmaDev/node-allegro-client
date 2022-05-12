interface AuthResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  expire_ts?: number;
  scope: string;
  jti: string;
}

interface Config {
  appName: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  account?: string;
  env?: "prod" | "dev";
  tokens?: AuthResponse | null;
  baseUrl?: string;
  apiUrl?: string;
  oAuth?: string;
}

interface Error {
  msg: string;
  err: string;
}

interface RequestOptions {
  method: "get" | "post" | "put" | "patch" | "delete";
  endpoint: string;
  headers?: { [key: string]: any };
  data?: any;
}

export { Config, AuthResponse, Error, RequestOptions };
