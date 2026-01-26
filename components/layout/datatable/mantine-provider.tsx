"use client";

import { MantineProvider } from "@mantine/core";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function MantineThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <MantineProvider>{children}</MantineProvider>;
  }

  return (
    <MantineProvider
      forceColorScheme={resolvedTheme === "dark" ? "dark" : "light"}
    >
      {children}
    </MantineProvider>
  );
}
