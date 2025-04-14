"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTermsDialog } from "@/hooks/use-dialog";
import { TermsDialog } from "@/components/dialogs/popi/popiDialog";
import useAuthStore from "@/store/authStore";

export function AdminDashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { hasAccepted } = useTermsDialog();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    if (user?.userType !== "Staff") {
      router.push("/unauthorized");
      return;
    }
  }, [isAuthenticated, user, router]);

  return (
    <>
      <TermsDialog />
      {!hasAccepted ? null : children}
    </>
  );
}
