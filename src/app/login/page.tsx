
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { emailPasswordSchema, type EmailPasswordFormValues } from '@/components/auth/auth-schema';
import { signInWithEmailPasswordAction } from '@/lib/auth-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Loader2, Briefcase } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isLoading: authLoading, mechanicTargetUser } = useAuth();

  const form = useForm<EmailPasswordFormValues>({
    resolver: zodResolver(emailPasswordSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (!authLoading && (user || mechanicTargetUser)) { // If regular user or mechanic session active
      router.replace('/dashboard');
    }
  }, [user, authLoading, mechanicTargetUser, router]);

  const onSubmit = async (values: EmailPasswordFormValues) => {
    setIsSubmitting(true);
    const result = await signInWithEmailPasswordAction(values);
    
    if (result.success) {
      toast({ title: 'Login Successful', description: 'Welcome back!' });
      router.refresh(); 
    } else {
      toast({ title: 'Login Failed', description: result.error, variant: 'destructive' });
    }
    setIsSubmitting(false);
  };
  
  if (authLoading || (!authLoading && (user || mechanicTargetUser))) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-12 w-12 text-primary mb-2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
          <CardTitle className="text-3xl font-bold">Welcome Back!</CardTitle>
          <CardDescription>Sign in to access your AutoBook dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-center">
            <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign Up
                </Link>
            </p>
            <Separator />
             <p className="text-sm text-muted-foreground">
                Are you a mechanic?{' '}
                <Link href="/mechanic-login" className="font-medium text-primary hover:underline">
                Access Owner Data <Briefcase className="inline-block ml-1 h-4 w-4" />
                </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}

// Added Separator, assuming it's from '@/components/ui/separator'
import { Separator } from '@/components/ui/separator';
