export type AdminUser = {
  admin_id: number;
  email: string;
  role: string;
};

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

export function loginAdmin(email: string, password: string) {
  return request<AdminUser>("/api/v1/auth_login.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export function getMe() {
  return request<AdminUser>("/api/v1/auth_me.php");
}

export function logoutAdmin() {
  return request<{ logged_out: true }>("/api/v1/auth_logout.php", {
    method: "POST",
  });
}
