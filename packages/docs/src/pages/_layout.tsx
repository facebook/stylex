import type { ReactNode } from "react";
import { Provider } from "@/components/provider";
import "@/styles/globals.css";
import DevStyleXHMR from "@/components/DevStyleXHMR";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DevStyleXHMR />
      <Provider>{children}</Provider>
    </>
  );
}
