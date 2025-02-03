import { DefaultSeo as NextDefaultSeo } from "next-seo";
import { siteSettings } from "@settings/site-settings";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const DefaultSeo = () => {
  const router = useRouter()
  const { query } = router
  const capitalizeWords = (str: string): string => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  useEffect(() => {
    const queryValues = Object.values(query).flat().map((value) => value ? capitalizeWords(value) : "").join(", ");
    const newTitle = queryValues
      ? `${siteSettings.name} - ${queryValues}`
      : siteSettings.name;
    document.title = newTitle;
  }, [query]);
  return (
    <NextDefaultSeo
      title={siteSettings.name}
      description={siteSettings.description}
      openGraph={{
        type: "website",
        locale: "en_IE",
        site_name: siteSettings.name,
      }}
      twitter={{
        handle: "@handle",
        site: "@site",
        cardType: "summary_large_image",
      }}
      additionalMetaTags={
        [
          {
            name: "viewport",
            content: "width=device-width, initial-scale=1 maximum-scale=1",
          },
          {
            name: "apple-mobile-web-app-capable",
            content: "yes",
          },
          {
            name: "theme-color",
            content: "#ffffff",
          },
        ]}
      additionalLinkTags={
        [
          {
            rel: "apple-touch-icon",
            href: "icons/apple-icon-180.png",
          },
          {
            rel: "manifest",
            href: "/manifest.json",
          },
        ]}
    />
  );
};
