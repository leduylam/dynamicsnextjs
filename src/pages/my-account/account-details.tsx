import Layout from "@components/layout/layout";
import AccountLayout from "@components/my-account/account-layout";
import AccountDetails from "@components/my-account/account-details";
import http from "@framework/utils/http";
import { GetServerSideProps } from "next";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";

export default function AccountDetailsPage({ user }: { user: any }) {
	console.log(user);

	return (
		<AccountLayout>
			<AccountDetails data={user.user} />
		</AccountLayout>
	);
}
export const getServerSideProps: GetServerSideProps = async ({ req }) => {

	const response = await http.get(API_ENDPOINTS.ME, {
		headers: {
			Authorization: `Bearer ${req.cookies.access_token}`,
			Cookie: req.headers.cookie || "", // Gửi toàn bộ cookies
		},
		withCredentials: true,
	});
	return {
		props: { user: response.data },
	};
};
AccountDetailsPage.Layout = Layout;

