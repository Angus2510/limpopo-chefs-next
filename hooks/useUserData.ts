import { useEffect } from "react";
import useAuthStore from "@/store/authStore";
import type { StudentData, StaffData, GuardianData } from "@/types/auth/auth";

export const useUserData = () => {
  const { user, userData, loading, error, fetchUserData } = useAuthStore();

  useEffect(() => {
    if (user && !userData && !loading) {
      fetchUserData();
    }
  }, [user, userData, loading, fetchUserData]);

  // Type guard functions
  const isStudentData = (data: any): data is StudentData => {
    return data && "student" in data;
  };

  const isStaffData = (data: any): data is StaffData => {
    return data && "staff" in data;
  };

  const isGuardianData = (data: any): data is GuardianData => {
    return data && "guardian" in data;
  };

  return {
    userData,
    loading,
    error,
    refetch: fetchUserData,
    // Helper methods to get typed data
    getStudentData: () => (isStudentData(userData) ? userData : null),
    getStaffData: () => (isStaffData(userData) ? userData : null),
    getGuardianData: () => (isGuardianData(userData) ? userData : null),
  };
};
