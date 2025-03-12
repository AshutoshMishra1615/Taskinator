import { Toaster } from "@/components/ui/sonner";

export function RootLayout({ children }) {
  return (
    <div>
      {children}
      <Toaster closeButton />
    </div>
  );
}
