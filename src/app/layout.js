import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/store/CartContext";
import { AuthProvider } from "@/store/AuthContext";
import GoogleAnalytics from "@/components/shared/GoogleAnalytics";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Furnis | Premium Artisan Wooden Kitchenware",
  description:
    "Handcrafted wooden chopping boards, serving platters, kitchen organizers, and home decor. Sustainably sourced, food-safe, and built to last.",
  keywords:
    "wooden chopping boards, acacia serving trays, wooden kitchenware, handcrafted wood decor, organic kitchen accessories",
  authors: [{ name: "Furnis" }],
  openGraph: {
    title: "Furnis | Premium Artisan Wooden Kitchenware",
    description:
      "Handcrafted wooden chopping boards, serving platters, kitchen organizers, and home decor.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({ children }) {
  const gaId =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body style={{ margin: 0, padding: 0 }}>
        <GoogleAnalytics gaId={gaId} />
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
