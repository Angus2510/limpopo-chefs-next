"use server";
import { cookies } from "next/headers";
import useAuthStore from "@/store/authStore"; // Adjust this import according to your project structure

export async function fetchStudentData() {
  try {
    const token = useAuthStore.getState().getToken(); // Get the token from the store

    const response = await fetch("/api/students/data", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Add token to the Authorization header
      },
      credentials: "include", // Ensures cookies are sent with the request
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching student data:", error);
    throw error;
  }
}
