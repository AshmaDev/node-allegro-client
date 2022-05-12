import AllegroClient, { Config } from "../src";

const config: Config = {
  appName: "APP_NAME",
  clientId: "CLIENT_ID",
  clientSecret: "SECRET_KEY",
  redirectUri: "REDIRECT_URI",
  env: "dev",
};

test('Unauthorized request, should throw error: "missing_access_token"', async () => {
  const allegroClient = new AllegroClient(config);
  allegroClient
    .request({
      method: "get",
      endpoint: "/sale/categories",
    })
    .then(() => console.log("Do nothing"))
    .catch((e) => {
      expect(e.msg).toBe("missing_access_token");
    });
});
