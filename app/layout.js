import "./globals.css";
import StoreProvider from "../store/StoreProvider";
import AppProviders from "./providers";
import Shell from "./Shell";

export const metadata = {
  title: "NestBank",
  description: "Secure Digital Banking Portal",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="h-screen overflow-hidden flex flex-col">
        <AppProviders>
          <StoreProvider>
            <Shell>{children}</Shell>
          </StoreProvider>
        </AppProviders>
      </body>
    </html>
  );
}
