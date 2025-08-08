'use client';

import { useState, useEffect, useMemo } from 'react';
import { foreignWordReplacement, type ForeignWordReplacementOutput } from '@/ai/flows/foreign-word-replacement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, Eraser, FileSignature, FileText } from 'lucide-react';

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

export default function ForeignWordReplacementPage() {
  const [paragraph, setParagraph] = useState('');
  const [result, setResult] = useState<ForeignWordReplacementOutput | null>(null);
  const [choices, setChoices] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChoiceChange = (originalWord: string, replace: boolean) => {
    setChoices((prev) => ({ ...prev, [originalWord]: replace }));
  };

  const finalParagraph = useMemo(() => {
    if (!result || !paragraph) return '';
    let updated = paragraph;
    result.replacementOptions.forEach((opt) => {
      const choice = choices[opt.originalWord];
      if (choice) {
          const regex = new RegExp(`\\b${opt.originalWord}\\b`, 'gi');
          updated = updated.replace(regex, opt.suggestedReplacement);
      }
    });
    return updated;
  }, [choices, result, paragraph]);

  useEffect(() => {
    if (result) {
      const initialChoices = result.replacementOptions.reduce((acc, opt) => {
        acc[opt.originalWord] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setChoices(initialChoices);
    }
  }, [result]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paragraph.trim()) {
      toast({ title: 'பிழை', description: 'பகுப்பாய்வு செய்ய உரையை உள்ளிடவும்.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const res = await foreignWordReplacement({ paragraph });
      setResult(res);
    } catch (error) {
      console.error(error);
      toast({ title: 'செயல்முறை தோல்வியுற்றது', description: 'மீண்டும் முயற்சிக்கவும்.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="font-headline text-4xl font-bold text-primary">பிறமொழி சொல் மாற்றி</h1>
        <p className="mt-2 text-lg text-muted-foreground">பத்தியில் உள்ள பிறமொழிச் சொற்களைக் கண்டறிந்து சரியான தமிழ்ச் சொற்களால் மாற்றவும்.</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2"><FileText className="w-6 h-6" /> உரையை உள்ளிடவும்</CardTitle>
          <CardDescription>கலப்பு மொழி பத்தியை இங்கே ஒட்டவும்.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <Textarea
              value={paragraph}
              onChange={(e) => setParagraph(e.target.value)}
              placeholder="உங்கள் உரையை இங்கே உள்ளிடவும்..."
              rows={8}
              className="text-base"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <><Bot className="mr-2 h-4 w-4 animate-spin" /> கண்டறிகிறது...</>
              ) : 'கண்டறிந்து மாற்று'}
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
              <CardTitle className="font-headline text-2xl flex items-center gap-2"><FileSignature className="w-6 h-6" /> பகுப்பாய்வு செய்யப்பட்ட உரை</CardTitle>
            </CardHeader>
            <CardContent>
              <HighlightedText text={result.highlightedText} />
            </CardContent>
          </Card>

          {result.replacementOptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2"><Eraser className="w-6 h-6" /> மாற்றுவதற்கான பரிந்துரைகள்</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.replacementOptions.map((opt, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <span className="text-muted-foreground">பிறமொழி சொல்: </span>
                      <span className="font-semibold text-accent">{opt.originalWord}</span>
                      <span className="mx-2 text-muted-foreground">→</span>
                      <span className="text-muted-foreground">தமிழ் சொல்: </span>
                      <span className="font-semibold text-primary">{opt.suggestedReplacement}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`switch-${index}`} className="text-muted-foreground">வை</Label>
                      <Switch
                        id={`switch-${index}`}
                        checked={choices[opt.originalWord] ?? true}
                        onCheckedChange={(checked) => handleChoiceChange(opt.originalWord, checked)}
                      />
                      <Label htmlFor={`switch-${index}`} className="text-primary">மாற்று</Label>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">இறுதிப் பத்தி</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed bg-secondary/50 p-4 rounded-md">{finalParagraph}</p>
            </CardContent>
            <CardFooter>
                <Button onClick={() => navigator.clipboard.writeText(finalParagraph)}>நகலெடு</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
