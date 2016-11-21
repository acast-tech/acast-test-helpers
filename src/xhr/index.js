import stubber from './stubber';
import { waitUntil } from '../async';

let isFakingXhr = false;

export function startFakingXhr() {
  stubber.start();
  isFakingXhr = true;
}

export function stopFakingXhr() {
  if (!isFakingXhr) {
    throw new Error(`${stopFakingXhr.name} can only be used after call to ${startFakingXhr.name}!`);
  }
  stubber.reset();
  isFakingXhr = false;
}

export function findXhr(method, url) {
  if (!isFakingXhr) {
    throw new Error(`${findXhr.name} can only be used between calls to ${startFakingXhr.name} and ${stopFakingXhr.name}!`);
  }
  return stubber.match(method, url);
}

export function waitUntilXhrExists(method, url) {
  waitUntil(() => findXhr(method, url));
}