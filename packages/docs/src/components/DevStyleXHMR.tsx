"use client";

import { useEffect } from "react";

function DevStyleXHMR() {
  useEffect(() => {
    // @ts-ignore
    import("virtual:stylex:css-only");
  }, []);
  return <link rel="stylesheet" href="/virtual:stylex.css" />;
}

function EmptyStub() {
  return null;
}

export default import.meta.env.DEV ? DevStyleXHMR : EmptyStub;
