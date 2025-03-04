import Container from '@components/ui/container';
import Layout from '@components/layout/layout';
import LoginForm from '@components/auth/login-form';
import PageHeader from '@components/ui/page-header';
import RegisterApiForm from '@components/auth/register-api-form';

export default function RegisterApi() {
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