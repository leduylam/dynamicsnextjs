import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { AnimatePresence } from "framer-motion";
import { ManagedUIContext } from "@contexts/ui.context";
import ManagedModal from "@components/common/modal/managed-modal";
import ManagedDrawer from "@components/common/drawer/managed-drawer";
import { useEffect, useRef, useMemo } from "react";
import { QueryClient, QueryClientProvider, HydrationBoundary } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { DefaultSeo } from "@components/common/default-seo";

import "@fontsource/open-sans";
import "@fontsource/open-sans/600.css";
import "@fontsource/open-sans/700.css";
import "@fontsource/satisfy";
import "react-toastify/dist/ReactToastify.css";
import "@styles/scrollbar.css";
import "@styles/swiper-carousel.css";
import "@styles/custom-plugins.css";
import "@styles/tailwind.css";
import "@styles/rc-drawer.css";
import "@framework/utils/http";
import { getDirection } from "@utils/get-direction";
import { appWithTranslation } from "next-i18next";

function handleExitComplete() {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0 });
  }
}

function Noop({ children }: React.PropsWithChildren<{}>) {
  return <>{children}</>;
}

const CustomApp = ({ Component, pageProps }: AppProps) => {
  const queryClientRef = useRef<QueryClient | null>(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }
  const router = useRouter();
  const dir = getDirection(router.locale);
  useEffect(() => {
    document.documentElement.dir = dir;
  }, [dir]);
  const Layout = (Component as any).Layout || Noop;
  const authData = useMemo(() => {
    try {
      if (pageProps.__headers?.["x-auth-data"]) {
        return JSON.parse(pageProps.__headers["x-auth-data"]);
      }
    } catch (error) {
      console.error("Error parsing auth data:", error);
    }
    return null;
  }, [pageProps.__headers]);
  return (
    <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
      <QueryClientProvider client={queryClientRef.current}>
        <HydrationBoundary state={pageProps.dehydratedState}>
          <ManagedUIContext initialAuthData={authData}>
            <Layout pageProps={pageProps}>
              <DefaultSeo />
              <Component {...pageProps} key={router.route} />
              <ToastContainer />
            </Layout>
            <ManagedModal />
            <ManagedDrawer />
          </ManagedUIContext>
        </HydrationBoundary>
      </QueryClientProvider>
    </AnimatePresence>
  );
};

export default appWithTranslation(CustomApp);
