import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { findOrderById, findOrdersByEmail, toOrderCode, type Order } from "@/lib/orders-api";

const statusSteps = ["received", "in-progress", "completed", "rejected"] as const;
const statusLabels: Record<string, string> = {
  received: "Received",
  "in-progress": "In Progress",
  completed: "Completed",
  rejected: "Rejected",
};

const statusColorClasses: Record<(typeof statusSteps)[number], { dot: string; text: string }> = {
  received: {
    dot: "border-accent bg-accent",
    text: "text-foreground",
  },
  "in-progress": {
    dot: "border-yellow-500 bg-yellow-500",
    text: "text-yellow-600",
  },
  completed: {
    dot: "border-green-500 bg-green-500",
    text: "text-green-600",
  },
  rejected: {
    dot: "border-red-500 bg-red-500",
    text: "text-red-600",
  },
};

function StatusIndicator({ status }: { status: Order["order_status"] }) {
  const currentIdx = statusSteps.indexOf(status);
  return (
    <div className="flex items-center gap-2 mt-4">
      {statusSteps.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          {(() => {
            const isRejected = status === "rejected";
            const isActive = isRejected
              ? step === "rejected"
              : currentIdx >= 0 && i <= currentIdx;
            const color = statusColorClasses[step];
            return (
              <>
                <div
                  className={`h-3 w-3 rounded-full border-2 transition-colors ${
                    isActive ? color.dot : "border-border bg-transparent"
                  }`}
                />
                <span className={`text-xs font-medium ${isActive ? color.text : "text-muted-foreground"}`}>
                  {statusLabels[step]}
                </span>
              </>
            );
          })()}
          {i < statusSteps.length - 1 && <div className="h-px w-6 bg-border" />}
        </div>
      ))}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-heading text-lg font-bold">{toOrderCode(order.order_id)}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {order.first_name} {order.last_name} &middot; {order.email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {new Date(order.order_date).toLocaleDateString()}
          </span>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground leading-relaxed line-clamp-3">{order.order_desc}</p>
      {order.file_path && (
        <p className="mt-2 text-xs text-muted-foreground">Attached: {order.file_path}</p>
      )}
      <StatusIndicator status={order.order_status} />
    </div>
  );
}

export default function Track() {
  const [mode, setMode] = useState<"email" | "oid">("oid");
  const [query, setQuery] = useState("");
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [searchNonce, setSearchNonce] = useState(0);
  const [searched, setSearched] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  const byIdQuery = useQuery({
    queryKey: ["order", searchValue, searchNonce],
    queryFn: async () => findOrderById(searchValue ?? ""),
    enabled: searched && mode === "oid" && !!searchValue,
    retry: false,
  });

  const byEmailQuery = useQuery({
    queryKey: ["ordersByEmail", searchValue, searchNonce],
    queryFn: () => findOrdersByEmail(searchValue ?? ""),
    enabled: searched && mode === "email" && !!searchValue,
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (mode === "oid" && !/^(EDAN-)?\d+$/i.test(trimmed)) {
      setInputError("Use an order ID like EDAN-12 (or just 12).");
      setSearched(false);
      return;
    }

    setInputError(null);

    setSearchValue(trimmed);
    setSearchNonce((n) => n + 1);
    setSearched(true);
  };

  const loading = mode === "oid" ? byIdQuery.isLoading : byEmailQuery.isLoading;
  const error = mode === "oid" ? byIdQuery.error : byEmailQuery.error;
  const results: Order[] | null = mode === "oid"
    ? (byIdQuery.isError ? [] : byIdQuery.data ? [byIdQuery.data] : searched ? [] : null)
    : (byEmailQuery.data ?? (searched ? [] : null));

  return (
    <section className="container mx-auto px-6 py-24 md:py-32">
      <div className="mx-auto max-w-lg">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Track Your Order</h1>
        <p className="mt-2 text-muted-foreground">
          Look up your order by ID or email address.
        </p>

        {/* Mode toggle */}
        <div className="mt-8 flex rounded-lg border border-border bg-card p-1">
          <button
            onClick={() => { setMode("oid"); setSearchValue(null); setSearched(false); setQuery(""); }}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              mode === "oid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Order ID
          </button>
          <button
            onClick={() => { setMode("email"); setSearchValue(null); setSearched(false); setQuery(""); }}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              mode === "email" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Email
          </button>
        </div>

        <form onSubmit={handleSearch} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="query">
              {mode === "oid" ? "Order ID (e.g. EDAN-12)" : "Email Address"}
            </Label>
            <Input
              id="query"
              type={mode === "email" ? "email" : "text"}
              placeholder={mode === "oid" ? "EDAN-12" : "you@example.com"}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" size="lg">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </form>

        {/* Results */}
        {inputError && <p className="mt-6 text-sm text-destructive">{inputError}</p>}
        {loading && <p className="mt-6 text-sm text-muted-foreground">Searching...</p>}
        {error && <p className="mt-6 text-sm text-destructive">{(error as Error).message}</p>}

        {searched && results !== null && (
          <div className="mt-10">
            {results.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  No orders found. Double-check your {mode === "oid" ? "Order ID" : "email"} and try again.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {results.length} order{results.length !== 1 ? "s" : ""} found
                </p>
                {results.map((o) => (
                  <OrderCard key={o.order_id} order={o} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
