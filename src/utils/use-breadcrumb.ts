import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";

export function convertBreadcrumbTitle(value: string) {
  return value
    .replace(/-/g, " ")
    .replace(/oe/g, "ö")
    .replace(/ae/g, "ä")
    .replace(/ue/g, "ü")
    .toLowerCase();
}

type Breadcrumb = {
  breadcrumb: string;
  href: string;
};

type CategoryInfo = {
  name?: string;
};

export default function useBreadcrumb(currentCategory?: CategoryInfo | null) {
  const router = useRouter();
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[] | null>(null);

  useEffect(() => {
    if (!router?.asPath) {
      setBreadcrumbs(null);
      return;
    }

      const linkPath = router.asPath.split("/");
      linkPath.shift();

    const pathArray = linkPath.map((segment, index) => {
      const pathSplit = segment.split("?")[0];
        return {
          breadcrumb: pathSplit,
        href: "/" + linkPath.slice(0, index + 1).join("/"),
        };
      });

      setBreadcrumbs(pathArray);
  }, [router]);

  return useMemo(() => {
    if (!breadcrumbs) return breadcrumbs;

    const isCategoryRoute = router.pathname?.startsWith("/categories");
    if (!isCategoryRoute) {
  return breadcrumbs;
    }

    const filtered = breadcrumbs.filter(
      (crumb) => crumb.breadcrumb && crumb.breadcrumb !== "categories"
    );

    if (!filtered.length) {
      return filtered;
    }

    if (currentCategory?.name) {
      const lastIndex = filtered.length - 1;
      filtered[lastIndex] = {
        ...filtered[lastIndex],
        breadcrumb: currentCategory.name,
      };
    }

    return filtered;
  }, [breadcrumbs, currentCategory, router.pathname]);
}
