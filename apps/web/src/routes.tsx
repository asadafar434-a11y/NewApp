import { createBrowserRouter, Navigate } from "react-router";
import Root from "./pages/Root";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Hiring from "./pages/Hiring";
import Finance from "./pages/Finance";
import Marketing from "./pages/Marketing";
import Operations from "./pages/Operations";
import NewTask from "./pages/NewTask";
import Messages from "./pages/Messages";

export const router = createBrowserRouter([
  {
    path: "/auth",
    Component: Auth,
  },
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: "hiring", Component: Hiring },
      { path: "finance", Component: Finance },
      { path: "marketing", Component: Marketing },
      { path: "operations", Component: Operations },
      { path: "new-task", Component: NewTask },
      { path: "messages", Component: Messages },
      { path: "*", Component: () => <Navigate to="/" replace /> },
    ],
  },
]);
