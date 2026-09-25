import Layout from "@components/layout/layout";
import ErrorInformation from "@components/404/error-information";
import { GetStaticProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// Trang 500 tĩnh (Pages Router dựng lúc build) — trước đây không có, lỗi SSR rơi
// về trang mặc định của Next. Chữ đi qua dict `common` (en/vi), không hardcode.
export default function ServerErrorPage() {
  const { t } = useTranslation("common");
  return (
    <ErrorInformation
      title={t("error-500-heading")}
      text={t("error-500-sub-heading")}
    />
  );
}

ServerErrorPage.Layout = Layout;

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "forms", "footer"])),
  },
});
