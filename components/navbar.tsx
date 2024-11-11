import HeaderAuth from "@/components/header-auth";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full h-20 flex justify-between border-b border-b-foreground/10 ">
      <nav className="w-full h-full flex justify-between items-center p-5">
        <Link href={"/"}>
          <p className="font-semibold">Learning Next.js with Supabase</p>
        </Link>
        <HeaderAuth />
      </nav>
    </header>
  );
}
