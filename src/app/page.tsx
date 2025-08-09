'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BookOpenCheck, Replace, Languages, ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getRandomKural, type KuralData } from '@/lib/kural-data';

export default function Home() {
  const [kural, setKural] = useState<KuralData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const tools = [
    {
      title: 'பல பொருள் கண்டறி',
      description: 'சூழல் அடிப்படையில் ஒரு வார்த்தையின் பல அர்த்தங்களைக் கண்டறியவும்.',
      href: '/multiple-meanings',
      icon: <BookOpenCheck className="h-12 w-12 text-primary" />,
    },
    {
      title: 'பிறமொழி சொல் மாற்றி',
      description: 'ஒரு பத்தியில் உள்ள பிறமொழி வார்த்தைகளைக் கண்டறிந்து மாற்றவும்.',
      href: '/foreign-word-replacement',
      icon: <Replace className="h-12 w-12 text-primary" />,
    },
    {
      title: 'மொழிபெயர்ப்பாளர்',
      description: 'தமிழ் மற்றும் பிற மொழிகளுக்கு இடையில் உரையை மொழிபெயர்.',
      href: '/translator',
      icon: <Languages className="h-12 w-12 text-primary" />,
    },
  ];

  const showRandomKural = () => {
    const randomKural = getRandomKural();
    setKural(randomKural);
    setIsDialogOpen(true);
  };

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-start pt-24 p-4">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary">தமிழி</h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground">Tamil’s power, AI’s support</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {tools.map((tool) => (
          <Link href={tool.href} key={tool.href} className="block">
            <Card className="h-full transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col items-center text-center">
              <CardHeader>
                {tool.icon}
                <CardTitle className="font-headline text-2xl mt-4">{tool.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{tool.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Button
        variant="default"
        size="icon"
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg bg-card text-primary hover:bg-primary/90 hover:text-card"
        onClick={showRandomKural}
      >
        <ScrollText className="h-8 w-8" />
        <span className="sr-only">Thirukkural of the Day</span>
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md w-full bg-background text-foreground p-6 rounded-lg shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary text-center mb-4">
              அன்றைய திருக்குறள்
            </DialogTitle>
          </DialogHeader>
          {kural && (
            <div className="text-center space-y-4">
              <p className="font-bold text-lg text-accent">குறள்</p>
              <div>
                <p className="text-lg leading-relaxed">{kural.line1}</p>
                <p className="text-lg leading-relaxed">{kural.line2}</p>
              </div>
              <div>
                <p className="font-bold text-primary mb-2">பொருள்:</p>
                <p className="text-muted-foreground">{kural.meaning}</p>
              </div>
            </div>
          )}
           <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
           </DialogClose>
        </DialogContent>
      </Dialog>
    </main>
  );
}
