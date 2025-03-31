import Layout from "@components/layout/layout";
import ErrorInformation from "@components/404/error-information";

export default function ErrorPage() {
  return <ErrorInformation
    image="/assets/images/404.svg"
    title="Looks like you are lost"
    text="We can't find the page you're looking for"
  />;
}

ErrorPage.Layout = Layout;
