"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const loginStatus = localStorage.getItem("isLoggedIn");
    if (loginStatus === "true") {
      // Redirect to main page if logged in
      router.push("/main");
    } else {
      // Redirect to login page if not logged in
      router.push("/login");
    }
  }, [router]);

  // Return a loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="text-zinc-900 dark:text-zinc-50">Loading...</div>
    </div>
  );
}
