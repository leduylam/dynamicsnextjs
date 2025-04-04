import { NextSeo } from 'next-seo';
import Header from '@components/layout/header/header';
import Footer from '@components/layout/footer/footer';
import MobileNavigation from '@components/layout/mobile-navigation/mobile-navigation';
import Search from '@components/common/search';
export default function Layout({ children }: React.PropsWithChildren<{}>) {
	// const { acceptedCookies, onAcceptCookies } = useAcceptCookies();
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
				canonical="https://dynamicsportsvn.com/"
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
