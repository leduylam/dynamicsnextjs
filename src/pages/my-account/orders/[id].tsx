import Layout from "@components/layout/layout";
import AccountLayout from "@components/my-account/account-layout";
import OrderDetails from "@components/order/order-details";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
	
// ✅ OPTIMIZE: Component không có props nên không cần memo
export default function OrderPage() {
	return (
		<AccountLayout>
			<OrderDetails className="p-0" />
		</AccountLayout>
	);
}

OrderPage.Layout = Layout;

// ✅ OPTIMIZE: Loại bỏ try-catch không cần thiết
export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale!, ["common", "forms", "footer"])),
		},
	};
};

