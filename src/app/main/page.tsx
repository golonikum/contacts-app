"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-3xl">
            Добро пожаловать, {loggedInUser.email}!
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center mt-8">
          <Button onClick={handleLogout}>
            Выйти
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
