interface AuthResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
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
  type: "web" | "device";
  tokens?: AuthResponse | null;
}

interface RequestOptions {
  method: "get" | "post" | "put" | "patch" | "delete";
  endpoint: string;
  headers?: { [key: string]: any };
  data?: any;
}

export { Config, AuthResponse, RequestOptions };
