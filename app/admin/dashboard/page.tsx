"use client";

import { useEffect, useState } from "react";
import { ContentLayout } from "@/components/layout/content-layout";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import CalendarDemo from "@/components/features/calendar-demo";
import { getAllIntakeGroups } from "@/lib/actions/intakegroup/intakeGroups";
import { getAllOutcomes } from "@/lib/actions/outcome/outcomeQuery";

interface IntakeGroup {
  id: string;
  title: string;
  outcome: string[];
}

interface Outcome {
  id: string;
  title: string;
  type: string;
  hidden: boolean;
}

export default function ProtectedAdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, getToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [intakeGroups, setIntakeGroups] = useState<IntakeGroup[]>([]);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsData, outcomesData] = await Promise.all([
          getAllIntakeGroups(),
          getAllOutcomes(),
        ]);

        console.log("Fetched data:", { groupsData, outcomesData });

        if (Array.isArray(groupsData)) setIntakeGroups(groupsData);
        if (Array.isArray(outcomesData))
          setOutcomes(outcomesData.filter((o) => !o.hidden));
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    // Authentication check
    const checkAuthentication = async () => {
      console.group("Authentication Check");
      console.log("Initial Authentication Status:", isAuthenticated());

      const token = getToken();

      if (token) {
        try {
          const response = await fetch("/api/validate-token", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            console.log("Server-side token validation failed");
            throw new Error("Invalid token");
          }

          console.log("Server-side token validation successful");
          await fetchData(); // Fetch data after authentication
        } catch (error) {
          console.error("Token validation error:", error);
          useAuthStore.getState().logout();
        }
      }

      if (!isAuthenticated()) {
        console.log("Redirecting to login");
        router.push("/login");
      }

      setIsLoading(false);
      console.groupEnd();
    };

    checkAuthentication();
  }, [isAuthenticated, router, getToken, user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div>
      <ContentLayout title="Dashboard">
        <CalendarDemo intakeGroups={intakeGroups} outcomes={outcomes} />
      </ContentLayout>
    </div>
  );
}
