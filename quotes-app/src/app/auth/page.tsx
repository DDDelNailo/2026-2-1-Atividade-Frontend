"use client";

import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormState {
  username: string;
  password: string;
}

interface FormErrors {
  username?: string;
  password?: string;
  general?: string;
}

export default function AuthPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  function validate(values: FormState): FormErrors {
    const errs: FormErrors = {};
    if (!values.username.trim()) {
      errs.username = "O apelido (username) é obrigatório.";
    } else if (values.username.trim().length < 3) {
      errs.username = "O apelido deve ter pelo menos 3 caracteres.";
    }
    if (!values.password) {
      errs.password = "A senha é obrigatória.";
    } else if (values.password.length < 4) {
      errs.password = "A senha deve ter pelo menos 4 caracteres.";
    }
    return errs;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // limpa erro do campo ao digitar
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("https://dummyjson.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
          expiresInMins: 60,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        setErrors({
          general: data?.message || "Usuário ou senha inválidos.",
        });
        return;
      }

      const userData = await res.json();

      // Armazena dados do usuário no localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("accessToken", userData.accessToken);

      // Salva token em cookie para o middleware ler (expira em 1 dia)
      Cookies.set("accessToken", userData.accessToken, {
        expires: 1,
        sameSite: "Lax",
      });

      router.push("/dashboard");
    } catch {
      setErrors({ general: "Erro de conexão. Tente novamente." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
          <CardDescription>
            Use suas credenciais do DummyJSON
            <br />
            <span className="text-xs font-mono">ex: emilys / emilyspass</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {errors.general && (
              <Alert variant="destructive">
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="username">Apelido (username)</Label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="emilys"
                value={form.username}
                onChange={handleChange}
                disabled={loading}
                aria-invalid={!!errors.username}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando…" : "Entrar"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            <Link
              href="/"
              className="underline underline-offset-2 hover:text-foreground"
            >
              ← Voltar ao início
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
