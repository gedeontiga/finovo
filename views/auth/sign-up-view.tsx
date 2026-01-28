import { cn } from "@/lib/utils";
import { SignUp as Waitlist } from "@clerk/nextjs";
import { Metadata } from "next";
import { InteractiveGridPattern } from "./components/interactive-grid";
import { Sparkles, Upload, BarChart3, Calculator } from "lucide-react";
import { FloatingThemeToggle } from "./components/floating-theme-toggle";

export const metadata: Metadata = {
  title: "Sign Up | Finovo",
  description: "Create your Finovo account and start your financial journey.",
};

export default function SignUpViewPage() {
  return (
    <div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 overflow-hidden">
      {/* Floating Theme Toggle */}
      <FloatingThemeToggle />

      {/* Left Side - Branding & Interactive Background */}
      <div className="bg-muted relative hidden h-full flex-col p-10 lg:flex dark:border-r overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-linear-to-br from-[#1449e6] via-[#0a66c2] to-[#0a0a0a] z-0" />

        {/* Overlay gradient for depth */}
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent z-0" />

        {/* Interactive Grid - Behind everything */}
        <InteractiveGridPattern
          className={cn(
            "mask-[radial-gradient(500px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[0%] h-full skew-y-6 z-0",
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
            <h1 className="text-2xl font-bold text-white leading-tight">
              Take control of your finances, simply
            </h1>
            <p className="text-lg text-white/80">
              Create your{" "}
              <span className="font-bold bg-linear-to-r from-[#fe9a00] via-[#ffb84d] to-[#ffffff] bg-clip-text text-transparent">
                Finovo
              </span>{" "}
              account and move beyond spreadsheets.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4 animate-fadeIn delay-600">
            {[
              {
                icon: Calculator,
                text: "No formulas. Automatic budget calculations.",
                color: "text-yellow-400",
              },
              {
                icon: BarChart3,
                text: "Instant dashboards and visual insights.",
                color: "text-yellow-400",
              },
              {
                icon: Upload,
                text: "One-click Excel import.",
                color: "text-yellow-400",
              },
              {
                icon: Sparkles,
                text: "Simple, fast, and reliable",
                color: "text-yellow-400",
              },
            ].map((benefit, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 text-white/80 group/item hover:text-white transition-colors"
              >
                <div
                  className={`${benefit.color} group-hover/item:scale-110 transition-transform`}
                >
                  <benefit.icon className="w-6 h-6" />
                </div>
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 -right-20 w-72 h-72 bg-[#fe9a00]/20 rounded-full blur-3xl animate-pulse z-0" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-[#1449e6]/20 rounded-full blur-3xl animate-pulse delay-700 z-0" />
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="flex h-full items-center justify-center p-4 lg:p-8 bg-background">
        <div className="flex w-full max-w-md flex-col items-center justify-center animate-slideInRight">
          {/* Clerk Form with enhanced styling */}
          <div className="w-full">
            <Waitlist
              appearance={{
                elements: {
                  formButtonPrimary:
                    "bg-gradient-to-r from-[#1449e6] to-[#0a66c2] hover:from-[#0a66c2] hover:to-[#1449e6] transition-all duration-300 shadow-lg hover:shadow-xl",
                  card: "shadow-xl",
                  footerActionLink: "text-[#1449e6] hover:text-[#0a66c2]",
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
