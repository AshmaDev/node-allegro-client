import axios from "axios";
import { storeTokens } from "./utils";
import { AuthResponse, RequestOptions, Config } from "./types";

export function getAuthorizationCodeLink(this): string {
  const { baseUrl, clientId, redirectUri } = this.config;
  return `${baseUrl}/auth/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
}

function handleAuthResponse(client, data: AuthResponse) {
  if (!data.access_token) {
    throw data
  }
  data.expire_ts = data.expires_in + Date.now() / 1000;
  client.config.tokens = data;
  storeTokens(client.config.account, data);
}

export async function authorizeWithCode(this, code: string): Promise<AuthResponse> {
  const { baseUrl, redirectUri, oAuth, account } = this.config;

  try {
    const { data } = await axios.post(
      `${baseUrl}/auth/oauth/token?grant_type=authorization_code&redirect_uri=${redirectUri}&code=${code}`,
      null,
      {
        headers: {
          Authorization: `Basic ${oAuth}`,
        },
      })
      handleAuthResponse(this, data)
      return data
  } catch (err) {
    throw { msg: "authorization_error", err }
  }
}

export async function getDeviceVerificationLink(this): Promise<string> {
  const { baseUrl, clientId, oAuth } = this.config;
  const { data: { error, user_code, device_code, expires_in, verification_uri_complete } } = await axios.post(
    `${baseUrl}/auth/oauth/device`, `client_id=${clientId}`,
    {
      headers: {
        'Authorization': `Basic ${oAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    })
  if (error) {
    throw error
  }
  this.user_code = user_code
  this.deviceCode = device_code
  this.deviceCodeExpiration = new Date(Date.now() + expires_in*1000)
  return verification_uri_complete
}

export async function waitForDeviceVerification(this): Promise<AuthResponse> {
  const { baseUrl, oAuth } = this.config;
  while (Date.now() < this.deviceCodeExpiration.getTime()) {
    try {
      const { data } = await axios.post(
        `${baseUrl}/auth/oauth/token?grant_type=urn:ietf:params:oauth:grant-type:device_code&device_code=${this.deviceCode}`,
        null,
        {
          headers: {
            'Authorization': `Basic ${oAuth}`,
          },
        })
      handleAuthResponse(this, data)
      return data
    } catch (e: any) {
      if (e.response.status == 400) {
        const { error } = e.response.data
        if (error === 'authorization_pending') {
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue
        }
        else if (error === 'slow_down') {
          await new Promise(resolve => setTimeout(resolve, 10000));
          continue
        } else {
          throw { msg: "authorization_error", err: error }
        }
      }
      throw { msg: "authorization_error", err: e }
    }
  }
  throw { msg: "device_code expired", err: null }
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
