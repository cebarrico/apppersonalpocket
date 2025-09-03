"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

const NotFound = () => {
  const pathname = usePathname();

  useEffect(() => {
    console.log("Not found page loaded", pathname);
  }, [pathname]);

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-ice-white mb-4">
          404 - Página não encontrada
        </h1>
        <p className="text-light-gray-text mb-8">
          A página que você está procurando não existe.
        </p>
        <Link
          href="/"
          className="bg-aqua hover:bg-aqua-dark text-dark-teal px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
