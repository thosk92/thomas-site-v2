import { redirect } from "next/navigation";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default function Home() {
  redirect("/en");
}
