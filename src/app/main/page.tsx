"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Navigation } from "@/components/Navigation";

export default function MainPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  console.log(user);

  if (!user || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-zinc-900 dark:text-zinc-50">Загрузка...</div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-3xl">
              Добро пожаловать, {user.email}!
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center gap-4 mt-8">
            <Button onClick={() => router.push("/contacts")}>
              Мои контакты
            </Button>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
