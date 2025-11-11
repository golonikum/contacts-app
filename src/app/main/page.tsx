"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client";

export default function MainPage() {
  const [loggedInUser, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("user");

    if (!user) {
      // Redirect to login page if not logged in
      router.push("/login");
    } else {
      setUser(JSON.parse(user) as User);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!loggedInUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-zinc-900 dark:text-zinc-50">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-black dark:border dark:border-zinc-800">
        <h1 className="mb-6 text-3xl font-bold text-center text-black dark:text-zinc-50">
          Добро пожаловать, {loggedInUser.email}!
        </h1>

        <div className="mt-8 text-center">
          <button
            onClick={handleLogout}
            className="rounded-md bg-zinc-900 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}
