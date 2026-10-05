import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import App from "./App.tsx";
import { AuthProvider } from "@/auth/AuthContext";
import { SocketProvider } from "@/realtime/SocketContext";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { queryClient } from "@/lib/query-client";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SocketProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </SocketProvider>
        </AuthProvider>
        <Toaster richColors position="top-center" />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
