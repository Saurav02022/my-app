import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import "./globals.css";

export const metadata = {
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="w-full h-full flex flex-col">
            <Navbar />
            <div className="w-full h-full min-h-screen">{children}</div>
            <Footer />
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
