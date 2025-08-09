import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/" className="mr-4">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Home</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-headline font-bold text-primary">
            தமிழி
          </h1>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
