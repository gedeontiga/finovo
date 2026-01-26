"use client";

import { MantineProvider, createTheme } from "@mantine/core";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const theme = createTheme({
  fontFamily: "inherit",
  primaryColor: "blue",
  defaultRadius: "md",
});

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
    return <MantineProvider theme={theme}>{children}</MantineProvider>;
  }

  return (
    <MantineProvider
      theme={theme}
      forceColorScheme={resolvedTheme === "dark" ? "dark" : "light"}
    >
      {children}
    </MantineProvider>
  );
}
