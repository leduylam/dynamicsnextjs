import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { buildCanonicalUrl } from '@utils/canonical-url';
import Header from '@components/layout/header/header';
import Footer from '@components/layout/footer/footer';
import MobileNavigation from '@components/layout/mobile-navigation/mobile-navigation';
import Search from '@components/common/search';

const ERROR_PATHNAMES = new Set(['/404', '/500', '/_error']);

export default function Layout({ children }: React.PropsWithChildren<{}>) {
	// const { acceptedCookies, onAcceptCookies } = useAcceptCookies();
	// H30-1: canonical theo đúng URL trang (bỏ query) — bản cũ cứng về trang chủ
	// ⇒ mọi PDP/PLP tự khai mình là bản sao của home.
	// Trang lỗi (404/500 dựng tĩnh) không khai canonical — không phải nội dung thật.
	const { asPath, pathname, locale, defaultLocale } = useRouter();
	const canonical = ERROR_PATHNAMES.has(pathname)
		? undefined
		: buildCanonicalUrl(asPath, locale, defaultLocale);
	return (
		<div className="flex flex-col min-h-screen">
			<NextSeo
				additionalMetaTags={[
					{
						name: 'viewport',
						content: 'width=device-width, initial-scale=1.0',
					},
				]}
				title="Dynamicsports VN"
				description="Dynamic Sports Company LTD is the exclusive distributor in Vietnam and Cambodia for some of the biggest brands in the golfing world today"
				canonical={canonical}
				openGraph={{
					url: 'https://dynamicsportsvn.com',
					title: 'Dynamicsports VN',
					description:
						'Dynamic Sports Company LTD is the exclusive distributor in Vietnam and Cambodia for some of the biggest brands in the golfing world today',

				}}
			/>
			<Header />
			<main
				className="relative flex-grow"
				style={{
					minHeight: '-webkit-fill-available',
					WebkitOverflowScrolling: 'touch',
				}}
			>
				{children}
			</main>
			<Footer />
			<MobileNavigation />
			<Search />
		</div>
	);
}
