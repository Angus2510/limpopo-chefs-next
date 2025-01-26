// app/page.tsx (or any other page)
import { redirect } from "next/navigation";

export default async function HomePage() {
  // If the user is not authenticated, redirect to the login page
  const isAuthenticated = false; // Replace this with actual authentication logic

  if (!isAuthenticated) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Welcome to the student portal</h1>
    </div>
  );
}
