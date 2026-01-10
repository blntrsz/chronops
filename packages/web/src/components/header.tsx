import { Link } from "@tanstack/react-router";

import { useState } from "react";

import { authClient } from "@/lib/auth";
import { BookOpen, FileText, Home, ListChecks, Menu, X } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const activeOrg = authClient.useActiveOrganization();
  const orgSlug = activeOrg.data?.slug;

  return (
    <>
      <header className="flex items-center bg-gray-800 p-4 text-white shadow-lg">
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-lg p-2 transition-colors hover:bg-gray-700"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <h1 className="ml-4 text-xl font-semibold">
          <Link to="/">
            <img
              src="/tanstack-word-logo-white.svg"
              alt="TanStack Logo"
              className="h-10"
            />
          </Link>
        </h1>
      </header>

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-80 transform flex-col bg-gray-900 text-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-700 p-4">
          <h2 className="text-xl font-bold">Navigation</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-2 transition-colors hover:bg-gray-800"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
            <Link
              to={orgSlug ? "/org/$slug" : ("/org/switcher" as const)}
              params={orgSlug ? { slug: orgSlug } : undefined}
            onClick={() => setIsOpen(false)}
            className="mb-2 flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800"
            activeProps={{
              className:
                "mb-2 flex items-center gap-3 rounded-lg bg-cyan-600 p-3 transition-colors hover:bg-cyan-700",
            }}
          >
            <Home size={20} />
            <span className="font-medium">Home</span>
          </Link>

            <Link
              to={orgSlug ? "/org/$slug/framework" : ("/org/switcher" as const)}
              params={orgSlug ? { slug: orgSlug } : undefined}
            onClick={() => setIsOpen(false)}
            className="mb-2 flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800"
            activeProps={{
              className:
                "mb-2 flex items-center gap-3 rounded-lg bg-cyan-600 p-3 transition-colors hover:bg-cyan-700",
            }}
          >
            <BookOpen size={20} />
            <span className="font-medium">Frameworks</span>
          </Link>

            <Link
              to={orgSlug ? "/org/$slug/control" : ("/org/switcher" as const)}
              params={orgSlug ? { slug: orgSlug } : undefined}
            onClick={() => setIsOpen(false)}
            className="mb-2 flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800"
            activeProps={{
              className:
                "mb-2 flex items-center gap-3 rounded-lg bg-cyan-600 p-3 transition-colors hover:bg-cyan-700",
            }}
          >
            <ListChecks size={20} />
            <span className="font-medium">Controls</span>
          </Link>

            <Link
              to={orgSlug ? "/org/$slug/document" : ("/org/switcher" as const)}
              params={orgSlug ? { slug: orgSlug } : undefined}
            onClick={() => setIsOpen(false)}
            className="mb-2 flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800"
            activeProps={{
              className:
                "mb-2 flex items-center gap-3 rounded-lg bg-cyan-600 p-3 transition-colors hover:bg-cyan-700",
            }}
          >
            <FileText size={20} />
            <span className="font-medium">Documents</span>
          </Link>
        </nav>
      </aside>
    </>
  );
}
