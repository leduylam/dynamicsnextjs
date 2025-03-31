import Container from "@components/ui/container";
import Layout from "@components/layout/layout";
import PageHeader from "@components/ui/page-header";
import OrderInformation from "@components/order/order-information";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";

export default function Order() {
	return (
		<>
			<PageHeader pageHeader="text-page-order" />
			<Container>
				<OrderInformation />
				{/* <Subscription /> */}
			</Container>
		</>
	);
}

Order.Layout = Layout;

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

