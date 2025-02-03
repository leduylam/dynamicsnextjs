import Link from "@components/ui/link";
import Layout from "@components/layout/layout";
import AccountLayout from "@components/my-account/account-layout";
import { ROUTES } from "@utils/routes";
import { useUI } from "@contexts/ui.context";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function AccountPage() {
    const router = useRouter()
    const { isAuthorized } = useUI()
    useEffect(() => {
        if (!isAuthorized) {
            router.push('/')
        }
    }, [isAuthorized])
    return (
        <AccountLayout>
            <h2 className="text-lg md:text-xl xl:text-2xl font-bold text-heading mb-3 xl:mb-5">
                Dashboard
            </h2>
            <p className=" text-sm leading-7 md:text-base md:leading-loose lowercase">
                From your account dashboard you can view your{" "}
                <Link
                    href={ROUTES.ORDERS}
                    className="text-heading underline font-semibold"
                >
                    recent orders
                </Link>
                , manage your{" "}
                <Link
                    href={ROUTES.ACCOUNT_DETAILS}
                    className="text-heading underline font-semibold"
                >
                    Account Details
                </Link>{" "}
                and{" "}
                <Link
                    href={ROUTES.CHANGE_PASSWORD}
                    className="text-heading underline font-semibold"
                >
                    change your password
                </Link>
                .
            </p>
        </AccountLayout>
    );
}

AccountPage.Layout = Layout;

