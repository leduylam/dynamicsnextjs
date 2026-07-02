import Document, {
	Html,
	Head,
	Main,
	NextScript,
	DocumentContext,
} from "next/document";
import { getDirection } from "@utils/get-direction";

export default class CustomDocument extends Document {
	static async getInitialProps(ctx: DocumentContext) {
		return await Document.getInitialProps(ctx);
	}
	render() {
		const { locale } = this.props.__NEXT_DATA__;
		return (
			<Html dir={getDirection(locale)}>
				<Head>
					<link rel="icon" href="/favicon.ico?v=2" sizes="any" />
					<link rel="shortcut icon" href="/favicon.ico?v=2" />
					<link rel="apple-touch-icon" href="/icons/apple-icon-180.png?v=2" />
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}
