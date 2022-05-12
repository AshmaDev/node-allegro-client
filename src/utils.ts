import Storage from "node-storage";
import { AuthResponse } from "./types";
const store = new Storage("./node_modules/node-allegro-client/tokens");

export const storeTokens = (a: string, t: AuthResponse): void => {
  store.put(`${a}.tokens`, t);
};

export const getTokens = (a: string): AuthResponse => {
  return store.get(`${a}.tokens`);
};
