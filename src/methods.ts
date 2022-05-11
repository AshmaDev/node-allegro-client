import axios from "axios";
import { storeTokens } from "./utils";
import { AuthResponse, RequestOptions } from "./types";

export function getOAuthLink(this): string {
  return `${this.config.baseUrl}/auth/oauth/authorize?response_type=code&client_id=${this.config.clientId}&redirect_uri=${this.config.redirectUri}`;
}

export function authorize(this, code: string): Promise<AuthResponse | Error> {
  const { baseUrl, redirectUri, oAuth, account } = this.config;

  return new Promise((resolve, reject) => {
    axios
      .post(
        `${baseUrl}/auth/oauth/token?grant_type=authorization_code&redirect_uri=${redirectUri}&code=${code}`,
        null,
        {
          headers: {
            Authorization: `Basic ${oAuth}`,
          },
        }
      )
      .then((res) => {
        if (!res.data.access_token)
          return reject({ msg: "authorization_error", err: res.data });
        this.config.tokens = res.data;
        storeTokens(account, res.data);
        return resolve(res.data);
      })
      .catch((err) => reject({ msg: "authorization_error", err }));
  });
}

export function request(this, options: RequestOptions): Promise<any | Error> {
  if (!this.config.tokens || !this.config.tokens.access_token) {
    return Promise.reject({
      msg: "missing_access_token",
      err: "Access token is missing!",
    });
  }

  return new Promise((resolve, reject) => {
    axios({
      method: options.method,
      url: `${this.config.apiUrl}${options.endpoint}`,
      data: options.data,
      headers: {
        Authorization: `Bearer ${this.config.tokens.access_token}`,
        Accept: "application/vnd.allegro.public.v1+json",
        ...options.headers,
      },
    })
      .then((res) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject({
          msg: "request_error",
          err,
        });
      });
  });
}
