import Layout from "@components/layout/layout";
import AccountLayout from "@components/my-account/account-layout";
import AccountDetails from "@components/my-account/account-details";

export default function AccountDetailsPage() {
	return (
		<AccountLayout>
			<AccountDetails/>
		</AccountLayout>
	);
}
AccountDetailsPage.Layout = Layout;

