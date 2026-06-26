"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[--color-brand] rounded-slds-md mb-4">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[--color-text-primary]">pwncorp ERP</h1>
          <p className="text-sm text-[--color-text-secondary] mt-1">
            Sistem Manajemen Bengkel
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-[--color-border-light] rounded-slds-md shadow-slds-md p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn--brand w-full justify-center h-10">
              Masuk
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[--color-text-secondary] mt-4">
          &copy; 2026 pwncorp. All rights reserved.
        </p>
      </div>
    </div>
  );
}
