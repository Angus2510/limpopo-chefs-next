import { ReactNode } from "react";
import Layout from "@/components/layout/Layout"

export default function GuardianLayout({ children }: { children: ReactNode }) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}
