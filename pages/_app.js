import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "../styles/globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex",
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

export default function App({ Component, pageProps }) {
  return (
    <main className={`${fraunces.variable} ${plex.variable} ${plexMono.variable} font-body`}>
      <Component {...pageProps} />
    </main>
  );
}
