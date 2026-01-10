import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { RegistryProvider } from "@effect-atom/atom-react";

import Header from "@/components/header";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Chronops",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  component: RootLayout,
  shellComponent: RootDocument,
});

function RootLayout() {
  const pathname = useRouterState().location.pathname;
  const hideHeader =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/otp" ||
    pathname.startsWith("/org");

  return (
    <div className="ds-app-bg">
      <RegistryProvider defaultIdleTTL={5 * 60 * 1000}>
        {!hideHeader && <Header />}
        <Outlet />
      </RegistryProvider>
    </div>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        {children}
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
