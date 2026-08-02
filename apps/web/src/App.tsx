import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { router } from "./routes";

{
  /* MARKER-MAKE-KIT-INVOKED */
}
{
  /* MARKER-MAKE-KIT-DISCOVERY-READ */
}
{
  /* MARKER-MAKE-KIT-TOKENS-READ */
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border-default)",
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
