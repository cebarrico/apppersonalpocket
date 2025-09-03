import { getUser } from "@/lib/auth-actions";

export async function ServerUser() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  return (
    <div className="text-sm text-gray-600">
      Logado como: {user.full_name} ({user.role})
    </div>
  );
}

// Hook para usar em Server Components
export async function useServerUser() {
  return await getUser();
}
