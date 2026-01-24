import { cn } from '@/lib/utils';
import { SignIn as ClerkSignInForm } from '@clerk/nextjs';
import { Metadata } from 'next';
import Link from 'next/link';
import { InteractiveGridPattern } from './components/interactive-grid';
import { buttonVariants } from '@/components/ui/button';
import { BarChart3, Shield, TrendingUp } from 'lucide-react';
import { FloatingThemeToggle } from './components/floating-theme-toggle';

export const metadata: Metadata = {
  title: 'Sign In | Finovo',
  description: 'Sign in to your Finovo account to manage your finances.'
};

export default function SignInViewPage() {
  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 overflow-hidden'>
      {/* Floating Theme Toggle */}
      <FloatingThemeToggle />

      {/* Left Side - Branding & Interactive Background */}
      <div className='bg-muted relative hidden h-full flex-col p-10 lg:flex dark:border-r overflow-hidden'>
        {/* Gradient Background */}
        <div className='absolute inset-0 bg-linear-to-br from-[#1449e6] via-[#0a66c2] to-[#0a0a0a] z-0' />

        {/* Overlay gradient for depth */}
        <div className='absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent z-0' />

        {/* Interactive Grid - Behind everything */}
        <InteractiveGridPattern
          className={cn(
            'mask-[radial-gradient(500px_circle_at_center,white,transparent)]',
            'inset-x-0 inset-y-[0%] h-full skew-y-6 z-0'
          )}
        />

        {/* Logo and Branding */}
        <div className="relative z-20 flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <img
              src="/finovo-icon.png"
              alt="Finovo Icon"
              className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
              width="40"
              height="40"
            />
            <div className="absolute inset-0 bg-[#fe9a00]/20 blur-xl group-hover:bg-[#fe9a00]/40 transition-all duration-300 rounded-full" />
          </div>
          <span className="font-bold text-3xl bg-linear-to-r from-[#fe9a00] via-[#ffb84d] to-[#ffffff] bg-clip-text text-transparent">
            Finovo
          </span>
        </div>

        {/* Value Proposition */}
        <div className="relative z-20 flex flex-col justify-center flex-1 space-y-6 max-w-lg">
          <div className="space-y-2 animate-fadeIn">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Welcome back to <span className="font-bold bg-linear-to-r from-[#fe9a00] via-[#ffb84d] to-[#ffffff] bg-clip-text text-transparent">
                Finovo
              </span>
            </h1>
            <p className="text-lg text-white/90">
              Your budgets, insights, and financial clarity — all in one place.
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 -right-20 w-72 h-72 bg-[#fe9a00]/20 rounded-full blur-3xl animate-pulse z-0" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-[#1449e6]/20 rounded-full blur-3xl animate-pulse delay-700 z-0" />
      </div>

      {/* Right Side - Sign In Form */}
      <div className='flex h-full items-center justify-center p-4 lg:p-8 bg-background'>
        <div className='flex w-full max-w-md flex-col items-center justify-center animate-slideInRight'>
          {/* Clerk Form with enhanced styling */}
          <div className="w-full">
            <ClerkSignInForm
              appearance={{
                elements: {
                  formButtonPrimary:
                    'bg-gradient-to-r from-[#1449e6] to-[#0a66c2] hover:from-[#0a66c2] hover:to-[#1449e6] transition-all duration-300 shadow-lg hover:shadow-xl',
                  card: 'shadow-xl',
                  footerActionLink: 'text-[#1449e6] hover:text-[#0a66c2]'
                }
              }}
              initialValues={{
                emailAddress: 'your_mail@example.com'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}