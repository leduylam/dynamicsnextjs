import Container from "@components/ui/container";
import Layout from "@components/layout/layout";
import LoginForm from "@components/auth/login-form";
import PageHeader from "@components/ui/page-header";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "@contexts/auth/auth-context";

export default function SignInPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user) {
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
      } else {
        router.replace("/");
      }
    }
  }, [loading, user, router]);

  return (
    <>
      <PageHeader pageHeader="Sign In" />
      <Container>
        <div className="py-16 lg:py-20">
          <LoginForm />
        </div>
      </Container>
    </>
  );
}

SignInPage.Layout = Layout;