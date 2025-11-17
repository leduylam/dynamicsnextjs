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

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  locale,
}) => {
  try {
    const response = await http.get(API_ENDPOINTS.APIKEY, {
        headers: {
            Authorization: `Bearer ${req.cookies.client_access_token}`,
        Cookie: req.headers.cookie || "",
        },
        withCredentials: true,
    });

    if (res) {
      res.setHeader("Cache-Control", "private, max-age=60");
    }

    return {
      props: {
        ...(await serverSideTranslations(locale!, ["common", "forms", "footer"])),
        apiKeys: response.data ?? null,
        error: null,
      },
    };
  } catch (error) {
    return {
        props: {
            ...(await serverSideTranslations(locale!, ["common", "forms", "footer"])),
        apiKeys: null,
        error: (error as Error)?.message ?? "Unable to load API keys",
        },
    };
  }
};

ConnectApiPage.Layout = Layout;
