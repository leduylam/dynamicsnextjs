import Layout from "@components/layout/layout";
import AccountLayout from "@components/my-account/account-layout";
import OrdersTable from "@components/my-account/orders-table";

export default function OrdersTablePage() {
	return (
		<AccountLayout>
			<OrdersTable />
		</AccountLayout>
	);
}

OrdersTablePage.Layout = Layout;

