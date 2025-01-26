// src/components/AdminLayout.tsx

import { ReactNode } from "react";
import Layout from "@/components/layout/Layout"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}
