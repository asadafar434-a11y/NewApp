import { RouterProvider } from "react-router";
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

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
