import Layout from "@components/layout/layout";
import AccountLayout from "@components/my-account/account-layout";
import http from "@framework/utils/http";
import { GetServerSideProps } from "next";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import ConnectApi from "@components/my-account/connect-api";

export default function ConnectApiPage({ apiKeys }: { apiKeys: any }) {
    return (
        <AccountLayout>
            <ConnectApi apiKey={apiKeys} />
        </AccountLayout>
    );
}
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const response = await http.get(API_ENDPOINTS.APIKEY, {
        headers: {
            Authorization: `Bearer ${req.cookies.access_token}`,
            Cookie: req.headers.cookie || "", // Gửi toàn bộ cookies
        },
        withCredentials: true,
    });
    return {
        props: { apiKeys: response.data },
    };
};
ConnectApiPage.Layout = Layout;

