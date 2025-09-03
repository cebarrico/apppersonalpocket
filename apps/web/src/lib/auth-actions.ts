"use server";

import { redirect } from "next/navigation";
import { createServerComponentClient } from "./supabase-server";
import { revalidatePath } from "next/cache";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createServerComponentClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Buscar o perfil do usuário para determinar o dashboard correto
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    const { data: userProfile } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();

    const dashboardUrl =
      userProfile?.role === "teacher"
        ? "/teacher-dashboard"
        : "/student-dashboard";

    revalidatePath(dashboardUrl);
    redirect(dashboardUrl);
  }

  return { error: null };
}

export async function signOut() {
  const supabase = await createServerComponentClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  redirect("/login");
}

export async function getUser() {
  const supabase = await createServerComponentClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Buscar dados adicionais do usuário
  const { data: userProfile } = await supabase
    .from("users")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .single();

  if (userProfile) {
    return userProfile;
  }

  // Fallback para usuários que não estão na tabela users
  return {
    id: user.id,
    email: user.email || "unknown@email.com",
    full_name:
      user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário",
    role: user.user_metadata?.role || "student",
  };
}
