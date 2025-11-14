"use client";

import { RootProvider } from "fumadocs-ui/provider/waku";
import type { ReactNode } from "react";

export function Provider({ children }: { children: ReactNode }) {
  return <RootProvider>{children}</RootProvider>;
}
