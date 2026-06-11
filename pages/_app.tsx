import type { AppProps } from 'next/app';

export default function CureRaysPagesApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
