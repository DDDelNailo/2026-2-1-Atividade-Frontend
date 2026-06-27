"use client";

import Cookies from "js-cookie";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useReducer, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Quote {
  id: number;
  quote: string;
  author: string;
}

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  image: string;
}

interface QuoteFormState {
  quote: string;
  author: string;
}

interface QuoteFormErrors {
  quote?: string;
  author?: string;
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

type QuoteAction =
  | { type: "SET"; payload: Quote[] }
  | { type: "ADD"; payload: Quote }
  | { type: "UPDATE"; payload: Quote }
  | { type: "DELETE"; id: number };

function quotesReducer(state: Quote[], action: QuoteAction): Quote[] {
  switch (action.type) {
    case "SET":
      return action.payload;
    case "ADD":
      return [action.payload, ...state];
    case "UPDATE":
      return state.map((q) =>
        q.id === action.payload.id ? action.payload : q,
      );
    case "DELETE":
      return state.filter((q) => q.id !== action.id);
    default:
      return state;
  }
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const QUOTES_STORAGE_KEY = "quotes_data";
const AUTHORS_STORAGE_KEY = "quotes_authors";

// ─── Componente principal ─────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [quotes, dispatch] = useReducer(quotesReducer, []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Controle do formulário / dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [formState, setFormState] = useState<QuoteFormState>({
    quote: "",
    author: "",
  });
  const [formErrors, setFormErrors] = useState<QuoteFormErrors>({});

  // Autores conhecidos (para sugestão de autocompletar)
  const [knownAuthors, setKnownAuthors] = useState<string[]>([]);
  const [authorSuggestions, setAuthorSuggestions] = useState<string[]>([]);

  // ── Verificação de autenticação ────────────────────────────────────────────

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.replace("/auth");
      return;
    }
    try {
      setUser(JSON.parse(stored));
    } catch {
      router.replace("/auth");
    }
  }, [router]);

  // ── Autores conhecidos ────────────────────────────────────────────────────

  const loadAuthors = useCallback((qs: Quote[]) => {
    const stored = localStorage.getItem(AUTHORS_STORAGE_KEY);
    const storedAuthors: string[] = stored ? JSON.parse(stored) : [];
    const apiAuthors = qs.map((q) => q.author);
    const merged = Array.from(
      new Set([...storedAuthors, ...apiAuthors]),
    ).sort();
    setKnownAuthors(merged);
    localStorage.setItem(AUTHORS_STORAGE_KEY, JSON.stringify(merged));
  }, []);

  function saveAuthors(authorsList: string[]) {
    localStorage.setItem(AUTHORS_STORAGE_KEY, JSON.stringify(authorsList));
    setKnownAuthors(authorsList);
  }

  function persistQuotes(updated: Quote[]) {
    localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(updated));
  }

  // ── Carrega quotes (API → localStorage) ───────────────────────────────────

  useEffect(() => {
    async function loadQuotes() {
      setLoading(true);
      setError(null);

      // Verifica cache local primeiro
      const cached = localStorage.getItem(QUOTES_STORAGE_KEY);
      if (cached) {
        try {
          const parsed: Quote[] = JSON.parse(cached);
          dispatch({ type: "SET", payload: parsed });
          loadAuthors(parsed);
          setLoading(false);
          return;
        } catch {
          // cache corrompido — busca da API
        }
      }

      try {
        const res = await fetch("https://dummyjson.com/quotes?limit=30");
        if (!res.ok) throw new Error("Falha ao buscar quotes");
        const data = await res.json();
        const fetchedQuotes: Quote[] = data.quotes;
        dispatch({ type: "SET", payload: fetchedQuotes });
        localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(fetchedQuotes));
        loadAuthors(fetchedQuotes);
      } catch {
        setError(
          "Não foi possível carregar as frases. Tente recarregar a página.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadQuotes();
  }, [loadAuthors]);

  // ── Logout ────────────────────────────────────────────────────────────────

  function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    Cookies.remove("accessToken");
    router.replace("/auth");
  }

  // ── Formulário ────────────────────────────────────────────────────────────

  function openCreateDialog() {
    setEditingQuote(null);
    setFormState({ quote: "", author: "" });
    setFormErrors({});
    setAuthorSuggestions([]);
    setDialogOpen(true);
  }

  function openEditDialog(q: Quote) {
    setEditingQuote(q);
    setFormState({ quote: q.quote, author: q.author });
    setFormErrors({});
    setAuthorSuggestions([]);
    setDialogOpen(true);
  }

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));

    // sugestões de autor
    if (name === "author" && value.trim().length > 0) {
      const matches = knownAuthors.filter((a) =>
        a.toLowerCase().includes(value.toLowerCase()),
      );
      setAuthorSuggestions(matches.slice(0, 5));
    } else if (name === "author") {
      setAuthorSuggestions([]);
    }

    if (formErrors[name as keyof QuoteFormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function selectAuthor(author: string) {
    setFormState((prev) => ({ ...prev, author }));
    setAuthorSuggestions([]);
  }

  function validateForm(values: QuoteFormState): QuoteFormErrors {
    const errs: QuoteFormErrors = {};
    if (!values.quote.trim()) {
      errs.quote = "A frase é obrigatória.";
    } else if (values.quote.trim().length < 10) {
      errs.quote = "A frase deve ter pelo menos 10 caracteres.";
    }
    if (!values.author.trim()) {
      errs.author = "O autor é obrigatório.";
    } else if (values.author.trim().length < 2) {
      errs.author = "O nome do autor deve ter pelo menos 2 caracteres.";
    }
    return errs;
  }

  function handleFormSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validateForm(formState);
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    if (editingQuote) {
      // UPDATE
      const updated: Quote = {
        ...editingQuote,
        quote: formState.quote.trim(),
        author: formState.author.trim(),
      };
      dispatch({ type: "UPDATE", payload: updated });
      const next = quotes.map((q) => (q.id === updated.id ? updated : q));
      persistQuotes(next);
    } else {
      // CREATE — gera ID único local
      const newQuote: Quote = {
        id: Date.now(),
        quote: formState.quote.trim(),
        author: formState.author.trim(),
      };
      dispatch({ type: "ADD", payload: newQuote });
      const next = [newQuote, ...quotes];
      persistQuotes(next);
    }

    // Salva autor nos conhecidos
    const author = formState.author.trim();
    if (author && !knownAuthors.includes(author)) {
      saveAuthors([...knownAuthors, author].sort());
    }

    setDialogOpen(false);
  }

  function handleDelete(id: number) {
    dispatch({ type: "DELETE", id });
    const next = quotes.filter((q) => q.id !== id);
    persistQuotes(next);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user.image && (
              <Image
                src={user.image}
                alt={user.username}
                width={36}
                height={36}
                className="rounded-full border"
              />
            )}
            <div>
              <p className="font-semibold text-sm leading-none">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Frases</h1>
            <p className="text-sm text-muted-foreground">
              {quotes.length} frase{quotes.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={openCreateDialog}>+ Nova frase</Button>
        </div>

        <Separator />

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {["s1", "s2", "s3", "s4", "s5", "s6"].map((sk) => (
              <Card key={sk} className="animate-pulse">
                <CardContent className="pt-6 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/3 mt-3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">Nenhuma frase ainda.</p>
            <p className="text-sm">
              Clique em &ldquo;+ Nova frase&rdquo; para começar.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {quotes.map((q) => (
              <QuoteCard
                key={q.id}
                quote={q}
                onEdit={openEditDialog}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Dialog de criação/edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingQuote ? "Editar frase" : "Nova frase"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="quote">Frase</Label>
              <textarea
                id="quote"
                name="quote"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Digite a frase célebre…"
                value={formState.quote}
                onChange={handleFormChange}
              />
              {formErrors.quote && (
                <p className="text-sm text-destructive">{formErrors.quote}</p>
              )}
            </div>

            <div className="space-y-1.5 relative">
              <Label htmlFor="author">Autor</Label>
              <Input
                id="author"
                name="author"
                placeholder="Nome do autor"
                value={formState.author}
                onChange={handleFormChange}
                autoComplete="off"
              />
              {formErrors.author && (
                <p className="text-sm text-destructive">{formErrors.author}</p>
              )}
              {/* Sugestões de autocomplete */}
              {authorSuggestions.length > 0 && (
                <ul className="absolute z-50 top-full mt-1 w-full bg-white border rounded-md shadow-md text-sm overflow-hidden">
                  {authorSuggestions.map((a) => (
                    <li key={a}>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-slate-100"
                        onClick={() => selectAuthor(a)}
                      >
                        {a}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingQuote ? "Salvar alterações" : "Criar frase"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Sub-componente: QuoteCard ────────────────────────────────────────────────

function QuoteCard({
  quote,
  onEdit,
  onDelete,
}: {
  quote: Quote;
  onEdit: (q: Quote) => void;
  onDelete: (id: number) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <Card className="flex flex-col justify-between h-full">
      <CardHeader className="pb-2">
        <blockquote className="text-sm leading-relaxed text-foreground italic">
          &ldquo;{quote.quote}&rdquo;
        </blockquote>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              — {quote.author}
            </span>
          </div>
          <div className="flex gap-1">
            {!confirmDelete ? (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={() => onEdit(quote)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  Apagar
                </Button>
              </>
            ) : (
              <>
                <span className="text-xs text-muted-foreground self-center">
                  Confirmar?
                </span>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 px-2 text-xs"
                  onClick={() => onDelete(quote.id)}
                >
                  Sim
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs"
                  onClick={() => setConfirmDelete(false)}
                >
                  Não
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
