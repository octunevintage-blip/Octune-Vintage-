import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <h1 className="font-serif text-5xl md:text-7xl mb-6 tracking-widest uppercase">404</h1>
      <h2 className="font-serif text-2xl md:text-3xl mb-4 italic text-ink/80">This piece has been archived.</h2>
      <p className="font-sans text-sm tracking-widest uppercase text-ink/60 mb-10 max-w-md">
        The page you're looking for no longer exists, or never did. Such is the nature of 1-of-1 pieces.
      </p>
      <Link href="/shop" className="btn btn-outline">
        Return to the Archives
      </Link>
    </div>
  );
}
