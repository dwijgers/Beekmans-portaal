import { requireUser } from "@/lib/auth";
import { Nav } from "@/components/nav";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const gebruiker = await requireUser();

  return (
    <>
      <Nav gebruiker={gebruiker} />
      <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </>
  );
}
