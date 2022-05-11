import { BASE_URL, API_URL, DEV_BASE_URL, DEV_API_URL } from "./constants";
import { Config, RequestOptions } from "./types";
import { getOAuthLink, authorize, request } from "./methods";
import { getTokens } from "./utils";

function AllegroClient(this, config: Config): void {
  if (!config) throw new Error("Config is missing");
  this.config = config;
  if (!config.env) this.config.env = "prod";
  this.config.baseUrl = BASE_URL;
  this.config.apiUrl = API_URL;
  if (config.env === "dev") {
    this.config.baseUrl = DEV_BASE_URL;
    this.config.apiUrl = DEV_API_URL;
  }
  if (!config.account) this.config.account = "default";
  this.config.oAuth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  this.config.tokens = getTokens(this.config.account) || null;
}

AllegroClient.prototype = {
  getOAuthLink,
  authorize,
  request,
};

export { Config, RequestOptions };
export default AllegroClient;
