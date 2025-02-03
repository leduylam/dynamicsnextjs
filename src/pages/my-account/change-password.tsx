import Layout from "@components/layout/layout";
import AccountLayout from "@components/my-account/account-layout";
import ChangePassword from "@components/my-account/change-password";

export default function ChangePasswordPage() {
	return (
		<AccountLayout>
			<ChangePassword />
		</AccountLayout>
	);
}

ChangePasswordPage.Layout = Layout;

