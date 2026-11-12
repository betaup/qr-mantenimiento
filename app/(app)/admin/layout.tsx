import { NavAdmin } from "@/components/nav-admin";

export default function LayoutAdmin({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex flex-col gap-8">
      <NavAdmin />
      {children}
    </div>
  );
}
