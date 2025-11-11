"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for success message from registration
  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      setError(message);
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        // Redirect to main page
        router.push("/main");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-black dark:border dark:border-zinc-800">
        <h1 className="mb-6 text-2xl font-bold text-center text-black dark:text-zinc-50">
          Вход
        </h1>

        {error && (
          <div className="mb-4 p-3 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Электронная почта
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center rounded-md bg-zinc-900 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:bg-zinc-500 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {isLoading ? "Вход..." : "Войти"}
            </button>
          </div>

          <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            Нет аккаунта?{" "}
            <a
              href="/register"
              className="font-medium text-zinc-900 hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-300"
            >
              Регистрация
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
