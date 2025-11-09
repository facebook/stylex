import { initClient } from "rwsdk/client";

if (import.meta.env.DEV) {
  // Minimal StyleX CSS HMR: listen for stylex:css-update and bust the CSS link
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import('virtual:stylex:css-only');
}

initClient();
