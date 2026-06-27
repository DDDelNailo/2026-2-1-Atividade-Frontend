import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Quotes App
          </CardTitle>
          <CardDescription className="text-base">
            Atividade Avaliativa — POS / DIATINF / IFRN
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Aluno</p>
            <p className="font-semibold text-lg">Danilo Correia Dantas</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Disciplina</p>
            <p className="font-medium">Programação Orientada a Serviços</p>
          </div>
          <div className="pt-2">
            <Link href="/auth">
              <Button className="w-full" size="lg">
                Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
