import Container from "@components/ui/container";
import AccountNav from "@components/my-account/account-nav";
import Breadcrumb from "@components/common/breadcrumb";
import { memo } from "react";

// ✅ OPTIMIZE: Memoize component để tránh re-render không cần thiết
const AccountLayout = memo<{ children: React.ReactNode }>(function AccountLayout({
  children,
}) {
  return (
    <>
      <Container>
        <div className="pt-8">
          <Breadcrumb />
        </div>
        <div className="py-16 lg:py-20 px-0 xl:max-w-screen-xl mx-auto flex md:flex-row w-full">
          <div className="flex flex-col md:flex-row w-full">
            <AccountNav />
            <div className="md:w-4/6 2xl:w-8/12 mt-4 md:mt-0">{children}</div>
          </div>
        </div>
      </Container>
    </>
  );
});

AccountLayout.displayName = 'AccountLayout';

export default AccountLayout;
