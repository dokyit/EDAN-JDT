export type OrderStatus = "received" | "in-progress" | "completed" | "rejected";

export type Order = {
  order_id: number;
  order_code?: string;
  first_name: string;
  last_name: string;
  email: string;
  order_desc: string;
  order_status: OrderStatus;
  order_date: string;
  file_path: string | null;
};

export function toOrderCode(orderId: number) {
  return `EDAN-${orderId}`;
}

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error: {
    message: string;
    details?: unknown;
  } | null;
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    ...init,
  });

  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || !json.success) {
    throw new Error(json?.error?.message ?? "Request failed");
  }

  return json.data;
}

export function createOrder(formData: FormData) {
  return request<{ order_id: number; order_code: string; order_status: OrderStatus }>("/api/v1/orders_create.php", {
    method: "POST",
    body: formData,
  });
}

export function findOrderById(idOrCode: string | number) {
  return request<Order>(`/api/v1/orders_get.php?id=${encodeURIComponent(String(idOrCode))}`);
}

export function findOrdersByEmail(email: string) {
  return request<Order[]>(`/api/v1/orders_by_email.php?email=${encodeURIComponent(email)}`);
}

export function adminListOrders(params: URLSearchParams) {
  return request<{ items: Order[]; page: number; pageSize: number; total: number }>(
    `/api/v1/admin_orders_list.php?${params.toString()}`,
  );
}

export function adminUpdateStatus(id: number, status: OrderStatus) {
  return request<{ id: number; status: OrderStatus }>("/api/v1/admin_orders_update_status.php", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });
}

export function adminDeleteOrder(id: number) {
  return request<{ deleted: true; id: number }>(`/api/v1/admin_orders_delete.php?id=${id}`, {
    method: "DELETE",
  });
}
