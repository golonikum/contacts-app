
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Simple authentication check
    if (login === 'admin' && password === '12qw34er56ty') {
      // Store authentication status in localStorage
      localStorage.setItem('isLoggedIn', 'true');
      // Redirect to main page
      router.push('/main');
    } else {
      setError('Invalid login or password');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-black dark:border dark:border-zinc-800">
        <h1 className="mb-6 text-2xl font-bold text-center text-black dark:text-zinc-50">Login</h1>

        {error && (
          <div className="mb-4 p-3 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="login" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Login
            </label>
            <input
              id="login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Password
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
              className="w-full flex justify-center rounded-md bg-zinc-900 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
