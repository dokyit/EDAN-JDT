export interface Order {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  details: string;
  fileName: string | null;
  status: "received" | "in-progress" | "completed";
  createdAt: string;
}

const STORAGE_KEY = "edan_orders";

function generateId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `EDAN-${num}`;
}

export function getOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOrder(data: Omit<Order, "id" | "status" | "createdAt">): Order {
  const orders = getOrders();
  const order: Order = {
    ...data,
    id: generateId(),
    status: "received",
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  return order;
}

export function findOrderById(id: string): Order | undefined {
  return getOrders().find((o) => o.id.toLowerCase() === id.toLowerCase());
}

export function findOrdersByEmail(email: string): Order[] {
  return getOrders().filter((o) => o.email.toLowerCase() === email.toLowerCase());
}

export function deleteOrder(id: string): void {
  const orders = getOrders().filter((o) => o.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}
