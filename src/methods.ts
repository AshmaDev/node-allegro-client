import axios from "axios";
import { storeTokens } from "./utils";
import { AuthResponse } from "./types";

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
        if (!res.data.access_token) return reject({ info: "Authorization error", error: res.data });

        storeTokens(account, res.data);
        return resolve(res.data);
      })
      .catch((err) => reject({ info: "Authorization error", error: err }));
  });
}
