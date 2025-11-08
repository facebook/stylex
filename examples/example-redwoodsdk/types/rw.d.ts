import { AppContext } from "../src/worker";

declare module "rwsdk/worker" {
  interface DefaultAppContext extends AppContext {}
}
