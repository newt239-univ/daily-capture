import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function resetLocation() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete("registeredLocation");
  redirect("/register-location");
}

export async function clearCache() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete("registeredLocation");
  cookieStore.delete("fixedPointShots");
  redirect("/");
}
