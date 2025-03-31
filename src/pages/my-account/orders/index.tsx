import Layout from "@components/layout/layout";
import AccountLayout from "@components/my-account/account-layout";
import OrdersTable from "@components/my-account/orders-table";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function OrdersTablePage() {
	return (
		<AccountLayout>
			<OrdersTable />
		</AccountLayout>
	);
}

OrdersTablePage.Layout = Layout;
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

