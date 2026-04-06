import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { adminDeleteOrder, adminListOrders, adminUpdateStatus, toOrderCode, type Order, type OrderStatus } from "@/lib/orders-api";
import { logoutAdmin } from "@/lib/auth";

const statuses: OrderStatus[] = ["received", "in-progress", "completed", "rejected"];

function AdminOrderRow({
  order,
  onUpdateStatus,
  onDelete,
}: {
  order: Order;
  onUpdateStatus: (id: number, status: OrderStatus) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-heading text-base font-bold">Order {toOrderCode(order.order_id)}</p>
          <p className="text-sm text-muted-foreground">
            {order.first_name} {order.last_name} - {order.email}
          </p>
        </div>
        <button
          onClick={() => onDelete(order.order_id)}
          className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          title="Delete order"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{order.order_desc}</p>
      {order.file_path && <p className="mt-2 text-xs text-muted-foreground">File: {order.file_path}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {statuses.map((s) => (
          <Button
            key={s}
            type="button"
            variant={order.order_status === s ? "default" : "outline"}
            size="sm"
            onClick={() => onUpdateStatus(order.order_id, s)}
          >
            {s}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default function Admin() {
  const [statusFilter, setStatusFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const queryClient = useQueryClient();

  const params = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", "1");
    p.set("pageSize", "25");
    if (statusFilter) p.set("status", statusFilter);
    if (emailFilter) p.set("email", emailFilter);
    return p;
  }, [statusFilter, emailFilter]);

  const listQuery = useQuery({
    queryKey: ["adminOrders", params.toString()],
    queryFn: () => adminListOrders(params),
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) => adminUpdateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["ordersByEmail"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminDeleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["ordersByEmail"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      queryClient.removeQueries({ queryKey: ["adminOrders"] });
    },
  });

  return (
    <section className="container mx-auto px-6 py-24 md:py-32">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Admin</h1>
        <p className="mt-2 text-muted-foreground">
          Manage orders, update statuses, and remove invalid submissions.
        </p>

        <div className="mt-8 flex justify-end">
          <Button type="button" variant="outline" onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending}>
            {logoutMutation.isPending ? "Signing out..." : "Sign out"}
          </Button>
        </div>

        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Filters</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="filterStatus">Status</Label>
              <select
                id="filterStatus"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filterEmail">Customer Email</Label>
              <Input
                id="filterEmail"
                type="email"
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                placeholder="customer@example.com"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {listQuery.isLoading && <p className="text-muted-foreground">Loading orders...</p>}
          {listQuery.isError && (
            <p className="text-sm text-destructive">{(listQuery.error as Error).message}</p>
          )}
          {deleteMutation.isError && (
            <p className="text-sm text-destructive">{(deleteMutation.error as Error).message}</p>
          )}

          {listQuery.data?.items?.map((order) => (
            <AdminOrderRow
              key={order.order_id}
              order={order}
              onUpdateStatus={(id, status) => updateMutation.mutate({ id, status })}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}

          {listQuery.data && listQuery.data.items.length === 0 && (
            <p className="text-muted-foreground">No orders match the current filters.</p>
          )}
        </div>
      </div>
    </section>
  );
}
