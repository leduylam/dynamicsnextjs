import Layout from "@components/layout/layout";
import AccountLayout from "@components/my-account/account-layout";
import AccountDetails from "@components/my-account/account-details";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";

export default function AccountDetailsPage() {
	return (
		<AccountLayout>
			<AccountDetails/>
		</AccountLayout>
	);
}
AccountDetailsPage.Layout = Layout;
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

