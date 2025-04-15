import Container from '@components/ui/container';
import Layout from '@components/layout/layout';
import PageHeader from '@components/ui/page-header';
import SignUpForm from '@components/auth/sign-up-form';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useUI } from '@contexts/ui.context';
import { useEffect, useState } from 'react';
export default function RegisterDynamic() {
    const { isAuthorized } = useUI();
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) return null;
    return (
        <>
            <PageHeader pageHeader="Register" />
            <Container>
                <div className="py-16 lg:py-20">
                    {isAuthorized === true ? (
                        <div className="text-center text-base text-green-600 bg-green-50 border border-green-300 px-4 py-3 rounded-lg">
                            You are already logged in. Please return to the order page to continue.
                        </div>
                    ) : (
                        <SignUpForm />
                    )}
                </div>
            </Container>
        </>
    );
}
RegisterDynamic.Layout = Layout

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale!, ["common", "forms", "footer"])),
        },
    };
};