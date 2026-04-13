"use client";

import { ReactNode } from "react";
import { DataProvider } from "../context/DataContext";

export function Providers({ children }: { children: ReactNode }) {
  return <DataProvider>{children}</DataProvider>;
}
