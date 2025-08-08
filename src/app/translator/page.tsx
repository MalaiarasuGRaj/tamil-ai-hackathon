'use client';

import { useState } from 'react';
import { translate, type TamilTranslatorOutput } from '@/ai/flows/tamil-translator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRightLeft, Bot, Languages } from 'lucide-react';

const languages = [
  { value: 'English', label: 'ஆங்கிலம்' },
  { value: 'Hindi', label: 'இந்தி' },
  { value: 'French', label: 'பிரெஞ்சு' },
  { value: 'Tamil', label: 'தமிழ்' },
];

export default function TranslatorPage() {
  const [text, setText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [result, setResult] = useState<TamilTranslatorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast({ title: 'பிழை', description: 'மொழிபெயர்க்க உரையை உள்ளிடவும்.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const res = await translate({ text, targetLanguage });
      setResult(res);
    } catch (error) {
      console.error(error);
      toast({ title: 'செயல்முறை தோல்வியுற்றது', description: 'மீண்டும் முயற்சிக்கவும்.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="font-headline text-4xl font-bold text-primary">மொழிபெயர்ப்பாளர்</h1>
        <p className="mt-2 text-lg text-muted-foreground">தமிழ் மற்றும் பிற மொழிகளுக்கு இடையில் உரையை எளிதாக மொழிபெயர்க்கவும்.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2"><Languages className="w-6 h-6" /> மொழிபெயர்ப்பு கருவி</CardTitle>
          <CardDescription>உங்கள் உரையை உள்ளிட்டு, இலக்கு மொழியைத் தேர்ந்தெடுத்து மொழிபெயர்க்கவும்.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4 items-start">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="உங்கள் உரையை இங்கே உள்ளிடவும்..."
                rows={10}
                className="text-base"
                disabled={isLoading}
              />
              <div className="h-full">
                {isLoading ? (
                  <Skeleton className="w-full h-full min-h-[220px] rounded-md" />
                ) : (
                  <Textarea
                    value={result?.translatedText || ''}
                    readOnly
                    placeholder="மொழிபெயர்ப்பு இங்கே தோன்றும்..."
                    rows={10}
                    className="text-base bg-secondary/50"
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground">இலக்கு மொழி:</p>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="மொழியைத் தேர்ந்தெடுக்கவும்" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? (
                  <><Bot className="mr-2 h-4 w-4 animate-spin" /> மொழிபெயர்க்கிறது...</>
                ) : (
                  <><ArrowRightLeft className="mr-2 h-4 w-4" /> மொழிபெயர்</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
