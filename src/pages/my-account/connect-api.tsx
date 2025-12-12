import Layout from "@components/layout/layout";
import AccountLayout from "@components/my-account/account-layout";
import http from "@framework/utils/http";
import { GetServerSideProps } from "next";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import ConnectApi from "@components/my-account/connect-api";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

type ConnectApiPageProps = {
  apiKeys: any | null;
  error?: string | null;
};

export default function ConnectApiPage({ apiKeys, error }: ConnectApiPageProps) {
  return (
    <AccountLayout>
      <ConnectApi apiKey={apiKeys} error={error} />
    </AccountLayout>
  );
}

ConnectApiPage.Layout = Layout;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  locale,
}) => {
  const [translations, apiResponse] = await Promise.allSettled([
    serverSideTranslations(locale!, ["common", "forms", "footer"]),
    http.get(API_ENDPOINTS.APIKEY, {
      headers: {
        Authorization: `Bearer ${req.cookies.client_access_token}`,
        Cookie: req.headers.cookie || "",
      },
      withCredentials: true,
    }),
  ]);

  if (res) {
    res.setHeader("Cache-Control", "private, max-age=60");
  }

  const apiKeys = apiResponse.status === 'fulfilled'
    ? apiResponse.value.data ?? null
    : null;
  const error = apiResponse.status === 'rejected'
    ? (apiResponse.reason as Error)?.message ?? "Unable to load API keys"
    : null;

  return {
    props: {
      ...(translations.status === 'fulfilled' ? translations.value : {}),
      apiKeys,
      error,
    },
  };
};
