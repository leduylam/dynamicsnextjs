import Container from '@components/ui/container';
import Layout from '@components/layout/layout';
import PageHeader from '@components/ui/page-header';
import RegisterApiForm from '@components/auth/register-api-form';
import { useUI } from '@contexts/ui.context';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next';

export default function RegisterApi() {
    const router = useRouter();
    const { isAuthorized } = useUI()
    useEffect(() => {
        if (!isAuthorized) {
            router.replace('/')
        }
    }, [isAuthorized]);
    return (
        <>
            <PageHeader pageHeader="Register" />
            <Container>
                <div className="py-16 lg:py-20">
                    <RegisterApiForm />
                </div>
            </Container>
        </>
    );
}
RegisterApi.Layout = Layout
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