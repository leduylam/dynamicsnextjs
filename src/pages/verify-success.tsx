import Layout from '@components/layout/layout';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
export default function VerifySuccessPage() {
    const router = useRouter();
    const { status } = router.query;
    const getMessage = () => {
        switch (status) {
            case 'success':
                return '🎉 Your email has been successfully verified. Please log in to continue.';
            case 'already_verified':
                return 'This email has already been verified. Please log in.';
            case 'invalid':
                return 'The verification link is invalid or has expired.';
            default:
                return '';
        }
    };
    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="bg-white border shadow p-6 rounded-lg text-center max-w-md">
                <h2 className="text-lg font-semibold mb-2">Account Verification</h2>
                <p className="text-gray-700">{getMessage()}</p>
            </div>
        </div>
    );
}
VerifySuccessPage.Layout = Layout
export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale!, ["common", "forms", "footer"])),
        },
    };
};