import Container from "@components/ui/container";
import Layout from "@components/layout/layout";
import PageHeader from "@components/ui/page-header";
import OrderInformation from "@components/order/order-information";

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

