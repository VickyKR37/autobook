
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mechanicLoginFormSchema, type MechanicLoginFormValues } from '@/components/auth/mechanic-auth-schema';
import { validateMechanicAccessAction } from '@/lib/auth-actions'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, UserCheck, Loader2, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';
import Link from 'next/link';

export default function MechanicLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isLoading: authLoading, setMechanicAccess, mechanicTargetUser } = useAuth();

  const form = useForm<MechanicLoginFormValues>({
    resolver: zodResolver(mechanicLoginFormSchema),
    defaultValues: { ownerEmail: '', accessCode: '' },
  });

  useEffect(() => {
    // If a regular user is logged in, or a mechanic session is already active, redirect to dashboard
    if (!authLoading && (user || mechanicTargetUser)) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, mechanicTargetUser, router]);

  const onSubmit = async (values: MechanicLoginFormValues) => {
    setIsSubmitting(true);
    // The validateMechanicAccessAction is a placeholder.
    // In a real app, it would securely validate the email and code against a backend data source.
    const result = await validateMechanicAccessAction(values.ownerEmail, values.accessCode);
    
    if (result.success && result.ownerEmail) {
      setMechanicAccess(result.ownerEmail, result.ownerUserId); // ownerUserId might be undefined with current mock
      toast({ title: 'Mechanic Access Granted', description: `You are now accessing data for ${result.ownerEmail}.` });
      router.push('/dashboard'); // Redirect to dashboard, which will now show owner's data
    } else {
      toast({ title: 'Access Denied', description: result.error || 'Invalid owner email or access code.', variant: 'destructive' });
    }
    setIsSubmitting(false);
  };
  
  if (authLoading || user || mechanicTargetUser) { // Show loader if auth state is pending or if already logged in (regular or mechanic)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
       <div className="absolute top-4 left-4">
        <Button variant="outline" asChild>
          <Link href="/login">
            <ChevronLeft className="mr-2 h-4 w-4" /> Regular User Login
          </Link>
        </Button>
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <KeyRound className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-3xl font-bold">Mechanic Access</CardTitle>
          <CardDescription>Enter owner's email and access code to view their vehicle data.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="ownerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Car Owner's Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="owner@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accessCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Code</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
                {isSubmitting ? 'Verifying...' : 'Access Owner Data'}
              </Button>
            </form>
          </Form>
        </CardContent>
         <CardFooter className="text-center">
          <p className="text-xs text-muted-foreground">
            This portal is for authorized mechanics only. Ensure you have consent from the vehicle owner.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
