import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BookOpenCheck, Replace, Languages } from 'lucide-react';

export default function Home() {
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
    </main>
  );
}
