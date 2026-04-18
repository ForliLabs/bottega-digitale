import Link from "next/link";

interface FooterProps {
  brand: string;
  tagline?: string;
}

export function Footer({ brand, tagline }: FooterProps) {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">{brand}</p>
            {tagline && (
              <p className="mt-1 text-sm text-gray-500">{tagline}</p>
            )}
          </div>
          <div className="mt-4 flex gap-6 md:mt-0">
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-700">
              Termini
            </Link>
            <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-700">
              Contatti
            </Link>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} {brand}. Tutti i diritti riservati. Made in Forlì 🇮🇹
        </p>
      </div>
    </footer>
  );
}
