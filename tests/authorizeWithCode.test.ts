import AllegroClient, { Config } from "../src";

const config: Config = {
  appName: "APP_NAME",
  clientId: "CLIENT_ID",
  clientSecret: "SECRET_KEY",
  redirectUri: "REDIRECT_URI",
  env: "dev",
};

test('Authorize with invalid_code, should throw error: "authorization_error"', () => {
  const allegroClient = new AllegroClient(config);
  allegroClient
    .authorizeWithCode("invalid_code")
    .then(() => console.log("Do nothing"))
    .catch((e) => {
      expect(e.msg).toBe("authorization_error");
    });
});
