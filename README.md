# node-allegro-client

Node.js Allegro REST API client - resource management wrapper
[![Unit Tests](https://github.com/AshmaDev/node-allegro-client/actions/workflows/node.js.yml/badge.svg)](https://github.com/AshmaDev/node-allegro-client/actions/workflows/node.js.yml)

## Getting Started

This package includes a simple resource management wrapper for Allegro REST Api. Currently only Code Flow Authorization is available.
See Allegro [docs](https://developer.allegro.pl/documentation/) for more details.

### Installation

```sh
npm i node-allegro-client
# or
yarn add node-allegro-client
```

### Usage

First of all, you need to create an application on [Allegro.pl](https://apps.developer.allegro.pl). Remember to select the WEB authorization type.

The first authorization example:

```ts
import AllegroClient, { Config } from 'node-allegro-client';

const config: Config = {
  appName: "APP_NAME", // Your App Name
  clientId: "CLIENT_ID", // App Client ID
  clientSecret: "SECRET_KEY", // App Secret Key
  redirectUri: "REDIRECT_URI", // Redirect Uri (the same as specified on the Allegro)
  env: "dev", // "dev" for development, "prod" for production
};

const allegroClient = new AllegroClient(config);
const oAuthLink = allegroClient.getOAuthLink();
```

Now, you should redirect user to oAuthLink to get oAuth code
Allegro will redirect you to redirectUri with oAuth code, eg. http://localhost:3000/allegro?code=YOUR_OAUTH_CODE

Authorize the application using the following method:

```ts
allegroClient.authorize("YOUR_OAUTH_CODE");
```

After correct authorization, access_token (valid for 12 hours) and refresh_token (valid for 3 months) will be generated. 
If you do not use this packege for 3 months, you will have to re-authorize app.

Now you can ask the Allegro for any resource:

```js
// ...
allegroClient.request({
        method: "get",
        endpoint: "/sale/categories",
      })
      .then((r) => {
        // do something with your data
      })
      .catch((e) => {
        console.log(e);
      });
      
allegroClient.request({
        method: "post",
        endpoint: "/sale/offers",
        data: { 
          // your data
        },
        headers: {
          // your custom headers, default content type: application/vnd.allegro.public.v1+json
        }
      })
      .then((r) => {
        // do something with your data
      })
      .catch((e) => {
        console.log(e);
      });
```

All possible resources, http methods and required data can be found in the [docs](https://developer.allegro.pl/documentation/).

## License

This project is licensed under the MIT License.
