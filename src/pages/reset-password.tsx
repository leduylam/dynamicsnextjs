import Container from "@components/ui/container";
import Layout from "@components/layout/layout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import ResetPasswordForm from "@components/auth/reset-password-form";
export default function ResetPasswordPage() {
  return (
    <>
      <Container>
        <div className="py-16 lg:py-20">
          <ResetPasswordForm />
        </div>
      </Container>
    </>
  );
}

ResetPasswordPage.Layout = Layout;
export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  try {
    return {
      props: {
        ...(await serverSideTranslations(locale!, [
          "common",
          "forms",
          "footer",
        ])),
      },
    };
  } catch (error) {
    return {
      props: {
        ...(await serverSideTranslations(locale!, [
          "common",
          "forms",
          "footer",
        ])),
      },
    };
  }
};
