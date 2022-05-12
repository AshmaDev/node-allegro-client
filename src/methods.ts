import axios from "axios";
import { storeTokens } from "./utils";
import { AuthResponse, RequestOptions, Config } from "./types";

export function getOAuthLink(this): string {
  const { baseUrl, clientId, redirectUri } = this.config;
  return `${baseUrl}/auth/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
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
      .then(({ data }) => {
        if (!data.access_token) {
          return reject({ msg: "authorization_error", err: data });
        }
        data.expire_ts = data.expires_in + Date.now() / 1000;
        this.config.tokens = data;
        storeTokens(account, data);
        return resolve(data);
      })
      .catch((err) => reject({ msg: "authorization_error", err }));
  });
}

export async function request(
  this,
  options: RequestOptions
): Promise<any | Error> {
  const { apiUrl, tokens } = this.config;
  if (!tokens || !tokens.access_token) {
    return Promise.reject({
      msg: "missing_access_token",
      err: "Access token is missing!",
    });
  }
  if (tokens && tokens.refresh_token && tokens.expire_ts - Date.now()/1000 < 3600) {
    await refresh(this.config);
  }

  return new Promise((resolve, reject) => {
    axios({
      method: options.method,
      url: `${apiUrl}${options.endpoint}`,
      data: options.data,
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
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

function refresh(config: Config): Promise<AuthResponse | Error> {
  const { baseUrl, redirectUri, oAuth, tokens, account } = config;

  if (!tokens || !tokens.refresh_token) {
    return Promise.reject({
      msg: "missing_refresh_token",
      err: "Refresh token is missing",
    });
  }

  return new Promise((resolve, reject) => {
    axios
      .post(
        `${baseUrl}/auth/oauth/token?grant_type=refresh_token&refresh_token=${tokens.refresh_token}&redirect_uri=${redirectUri}`,
        null,
        {
          headers: { Authorization: `Basic ${oAuth}` },
        }
      )
      .then(({ data }) => {
        if (!data.access_token) {
          return reject({ msg: "authorization_error", err: data });
        }
        data.expire_ts = data.expires_in + Date.now() / 1000;
        config.tokens = data;
        storeTokens(account!, data);
        return resolve(data);
      })
      .catch((err) => {
        return reject({
          info: "request_error",
          error: err,
        });
      });
  });
}
