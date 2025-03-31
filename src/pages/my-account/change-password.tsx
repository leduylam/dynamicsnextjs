import Layout from "@components/layout/layout";
import AccountLayout from "@components/my-account/account-layout";
import ChangePassword from "@components/my-account/change-password";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function ChangePasswordPage() {
	return (
		<AccountLayout>
			<ChangePassword />
		</AccountLayout>
	);
}

ChangePasswordPage.Layout = Layout;
export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
	try {
		return {
			props: {
				...(await serverSideTranslations(locale!, ["common", "forms", "footer"])),
			},
		};
	} catch (error) {
		return {
			props: {
				...(await serverSideTranslations(locale!, ["common", "forms", "footer"])),
			},
		};
	}
};

