import Link from "next/link";
import { useRouter } from "next/router";
import {
    IoHomeOutline,
    IoCartOutline,
    IoPersonOutline,
    IoSettingsOutline,
    IoLogOutOutline,
} from "react-icons/io5";
import { ROUTES } from "@utils/routes";
import { useLogoutMutation } from "@framework/auth/use-logout";

const accountMenu = [
    {
        slug: ROUTES.ACCOUNT,
        name: "Dashboard",
        icon: <IoHomeOutline className="w-5 h-5" />,
    },
    {
        slug: ROUTES.ORDERS,
        name: "Orders",
        icon: <IoCartOutline className="w-5 h-5" />,
    },
    {
        slug: ROUTES.ACCOUNT_DETAILS,
        name: "My Account",
        icon: <IoPersonOutline className="w-5 h-5" />,
    },
    {
        slug: ROUTES.CHANGE_PASSWORD,
        name: "Change Password",
        icon: <IoSettingsOutline className="w-5 h-5" />,
    },
];

export default function AccountNav() {
    const { mutate: logout } = useLogoutMutation();
    const { pathname } = useRouter();
    const newPathname = pathname.split("/").slice(2, 3);
    const mainPath = `/${newPathname[0]}`;
    return (
        <nav className="flex flex-col pb-2 md:w-2/6 2xl:w-4/12 ltr:md:pr-8 rtl:md:pl-8 ltr:lg:pr-12 rtl:lg:pl-12 ltr:xl:pr-16 rtl:xl:pl-16 ltr:2xl:pr-20 rtl:2xl:pl-20 md:pb-0">
            {accountMenu.map((item) => {
                const menuPathname = item.slug.split("/").slice(2, 3);
                const menuPath = `/${menuPathname[0]}`;
                return (
                    <Link
                        key={item.slug}
                        href={item.slug}
                        className={
                            mainPath === menuPath
                                ? "bg-gray-100 font-semibold flex items-center cursor-pointer text-sm lg:text-base text-heading py-3.5 px-4 lg:px-5 rounded mb-2 "
                                : "flex items-center cursor-pointer text-sm lg:text-base text-heading font-normal py-3.5 px-4 lg:px-5 rounded mb-2"
                        }
                    >
                        {item.icon}
                        <span className="ltr:pl-2 rtl:pr-2">
                            {`${item.name}`}
                        </span>
                    </Link>
                );
            })}
            <button
                className="flex items-center cursor-pointer text-sm lg:text-base text-heading font-normal py-3.5 px-4 lg:px-5 focus:outline-none"
                onClick={() => logout()}
            >
                <IoLogOutOutline className="w-5 h-5" />
                <span className="ltr:pl-2 rtl:pr-2">Logout</span>
            </button>
        </nav>
    );
}
