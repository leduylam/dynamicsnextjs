import Layout from "@components/layout/layout";
import AccountLayout from "@components/my-account/account-layout";
import OrdersTable from "@components/my-account/orders-table";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// ✅ OPTIMIZE: Component không có props nên không cần memo
export default function OrdersTablePage() {
	return (
		<AccountLayout>
			<OrdersTable />
		</AccountLayout>
	);
}

OrdersTablePage.Layout = Layout;

// ✅ OPTIMIZE: Loại bỏ try-catch không cần thiết
export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale!, ["common", "forms", "footer"])),
		},
	};
};

