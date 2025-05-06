import { useEffect, useState } from "react";
import { Collapse } from "@components/common/accordion";

interface Props {
	data: any;
}

const ProductMetaReview: React.FC<Props> = ({ data }) => {
	const [metas, setMetas] = useState<any[]>([]);
	const [expanded, setExpanded] = useState<number>(0);
	useEffect(() => {
		const specs = data?.spec ? JSON.parse(data.spec) : [];
		setMetas([
			{
				id: 1,
				title: 'SPECS',
				content: specs
			}
		])
	}, [data])
	const renderContent = (content: Array<{ id: number, spectValue: string }>) => {
		if (!content || content.length === 0) {
			return <p></p>;
		}
		return (
			<ul className="list-disc ml-6">
				{content.map((item, index) => (
					<li key={index}>{item.spectValue}</li>
				))}
			</ul>
		)

	}
	return (
		<>
			{metas.map((item: any, index: any) => (
				<Collapse
					i={index}
					key={item.title}
					title={item.title}
					translatorNS="review"
					content={
						metas.length === item.id ? (
							<>
								{renderContent(item.content)}
							</>
						) : (
							item.content
						)
					}
					expanded={expanded}
					setExpanded={setExpanded}
					variant="transparent"
				/>
			)
			)}
		</>
	);
};

export default ProductMetaReview;
