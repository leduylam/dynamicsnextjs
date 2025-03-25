import Container from "@components/ui/container";
import Layout from "@components/layout/layout";
import PageHeader from "@components/ui/page-header";
import CheckoutForm from "@components/checkout/checkout-form";
import CheckoutCard from "@components/checkout/checkout-card";
import { GetServerSideProps } from "next";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";

export default function CheckoutPage({ companies }: { companies: any }) {
  return (
    <>
      <PageHeader pageHeader="Checkout" />
      <Container>
        <div className="py-14 xl:py-20 px-0 2xl:max-w-screen-2xl xl:max-w-screen-xl mx-auto flex flex-col md:flex-row w-full">
          <div className="md:w-full lg:w-3/5 flex  h-full flex-col -mt-1.5">
            <CheckoutForm
              companies={companies.companies}
            />
          </div>
          <div className="md:w-full lg:w-2/5 ltr:md:ml-7 rtl:md:mr-7 ltr:lg:ml-10 rtl:lg:mr-10 ltr:xl:ml-14 rtl:xl:mr-14 flex flex-col h-full -mt-1.5">
            <CheckoutCard />
          </div>
        </div>
      </Container>
    </>
  );
}
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const response = await http.get(API_ENDPOINTS.COMPANIES, {
    headers: {
      Authorization: `Bearer ${req.cookies.access_token}`,
      Cookie: req.headers.cookie || "", // Gửi toàn bộ cookies
    },
    withCredentials: true,
  });
  return {
    props: { companies: response.data },
  };
};
CheckoutPage.Layout = Layout;
