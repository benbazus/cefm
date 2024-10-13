import { createBrowserRouter } from "react-router-dom";
import GeneralError from "./client/pages/errors/general-error.tsx";
import NotFoundError from "./client/pages/errors/not-found-error.tsx";
import MaintenanceError from "./client/pages/errors/maintenance-error.tsx";
import UnauthorisedError from "./client/pages/errors/unauthorised-error.tsx";

const router = createBrowserRouter([
  // Auth routes
  {
    path: "/sign-in",
    lazy: async () => ({
      Component: (await import("./client/pages/auth/sign-in.tsx")).default,
    }),
  },
  {
    path: "/sign-in-2",
    lazy: async () => ({
      Component: (await import("./client/pages/auth/confirm-email.tsx"))
        .default,
    }),
  },
  {
    path: "/sign-up",
    lazy: async () => ({
      Component: (await import("./client/pages/auth/sign-up.tsx")).default,
    }),
  },
  {
    path: "/forgot-password",
    lazy: async () => ({
      Component: (await import("./client/pages/auth/forgot-password.tsx"))
        .default,
    }),
  },
  {
    path: "/otp",
    lazy: async () => ({
      Component: (await import("./client/pages/auth/otp.tsx")).default,
    }),
  },

  // Main routes
  {
    path: "/",
    lazy: async () => {
      const AppShell = await import("./client/components/app-shell.tsx");
      return { Component: AppShell.default };
    },
    errorElement: <GeneralError />,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import("./client/pages/dashboard/index.tsx"))
            .default,
        }),
      },
      {
        path: "tasks",
        lazy: async () => ({
          Component: (await import("@/pages/tasks")).default,
        }),
      },
      {
        path: "chats",
        lazy: async () => ({
          Component: (await import("@/pages/chats")).default,
        }),
      },
      {
        path: "apps",
        lazy: async () => ({
          Component: (await import("@/pages/apps")).default,
        }),
      },
      {
        path: "users",
        lazy: async () => ({
          Component: (await import("@/components/coming-soon")).default,
        }),
      },
      {
        path: "analysis",
        lazy: async () => ({
          Component: (await import("@/components/coming-soon")).default,
        }),
      },
      {
        path: "extra-components",
        lazy: async () => ({
          Component: (await import("@/pages/extra-components")).default,
        }),
      },
      {
        path: "settings",
        lazy: async () => ({
          Component: (await import("./client/pages/settings/index.tsx"))
            .default,
        }),
        errorElement: <GeneralError />,
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (
                await import("./client/pages/settings/profile/index.tsx")
              ).default,
            }),
          },
          {
            path: "account",
            lazy: async () => ({
              Component: (
                await import("./client/pages/settings/account/index.tsx")
              ).default,
            }),
          },
          {
            path: "appearance",
            lazy: async () => ({
              Component: (
                await import("./client/pages/settings/appearance/index.tsx")
              ).default,
            }),
          },
          {
            path: "notifications",
            lazy: async () => ({
              Component: (
                await import("./client/pages/settings/notifications/index.tsx")
              ).default,
            }),
          },
          {
            path: "display",
            lazy: async () => ({
              Component: (
                await import("./client/pages/settings/display/index.tsx")
              ).default,
            }),
          },
          {
            path: "error-example",
            lazy: async () => ({
              Component: (
                await import("./client/pages/settings/error-example/index.tsx")
              ).default,
            }),
            errorElement: <GeneralError className="h-[50svh]" minimal />,
          },
        ],
      },
    ],
  },

  // Error routes
  { path: "/500", Component: GeneralError },
  { path: "/404", Component: NotFoundError },
  { path: "/503", Component: MaintenanceError },
  { path: "/401", Component: UnauthorisedError },

  // Fallback 404 route
  { path: "*", Component: NotFoundError },
]);

export default router;
