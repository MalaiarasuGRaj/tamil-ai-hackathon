'use client';

import { useState } from 'react';
import { multipleMeaningsFinder, type MultipleMeaningsFinderOutput } from '@/ai/flows/multiple-meanings-finder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, FileText, Lightbulb } from 'lucide-react';

const HighlightedText = ({ text }: { text: string }) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <p className="text-lg leading-relaxed">
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={index} className="font-bold text-accent rounded-md px-1 py-0.5 bg-accent/20">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      })}
    </p>
  );
};

export default function MultipleMeaningsPage() {
  const [paragraph, setParagraph] = useState('');
  const [result, setResult] = useState<MultipleMeaningsFinderOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paragraph.trim()) {
      toast({
        title: 'பிழை',
        description: 'பகுப்பாய்வு செய்ய உரையை உள்ளிடவும்.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const res = await multipleMeaningsFinder({ paragraph });
      setResult(res);
    } catch (error) {
      console.error(error);
      toast({
        title: 'செயல்முறை தோல்வியுற்றது',
        description: 'மீண்டும் முயற்சிக்கவும்.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="font-headline text-4xl font-bold text-primary">பல பொருள் கண்டறி</h1>
        <p className="mt-2 text-lg text-muted-foreground">ஒரு பத்தியில் உள்ள சொற்களின் பல அர்த்தங்களைச் சூழலுடன் கண்டறியுங்கள்.</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2"><FileText className="w-6 h-6" /> உரையை உள்ளிடவும்</CardTitle>
          <CardDescription>கீழேயுள்ள பெட்டியில் ஒரு தமிழ் பத்தியை ஒட்டவும்.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <Textarea
              value={paragraph}
              onChange={(e) => setParagraph(e.target.value)}
              placeholder="உங்கள் தமிழ் உரையை இங்கே உள்ளிடவும்..."
              rows={8}
              className="text-base"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Bot className="mr-2 h-4 w-4 animate-spin" />
                  பகுப்பாய்வு செய்கிறது...
                </>
              ) : (
                'பகுப்பாய்வு செய்'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="space-y-6">
          <Card>
            <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
            <CardContent><Skeleton className="h-20 w-full" /></CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      )}

      {result && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2"><Lightbulb className="w-6 h-6" /> முன்னிலைப்படுத்தப்பட்ட பத்தி</CardTitle>
            </CardHeader>
            <CardContent>
              <HighlightedText text={result.highlightedParagraph} />
            </CardContent>
          </Card>

          {result.ambiguousWords.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">பலபொருள் சொற்கள்</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {result.ambiguousWords.map((wordData, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-xl font-bold text-primary hover:no-underline">
                      {wordData.word}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        {wordData.meanings.map((meaning, mIndex) => (
                          <Card key={mIndex} className="bg-secondary/50">
                            <CardContent className="p-4">
                              <p className="font-semibold text-lg">{meaning.meaning}</p>
                              <div className="flex items-center gap-2 mt-2 mb-3">
                                <p className="text-sm text-muted-foreground">நம்பகத்தன்மை: {Math.round(meaning.confidence * 100)}%</p>
                                <Progress value={meaning.confidence * 100} className="w-1/2 h-2" />
                              </div>
                              <p className="text-sm italic text-muted-foreground">"{meaning.exampleSentence}"</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
          )}
        </div>
      )}
    </div>
  );
}
