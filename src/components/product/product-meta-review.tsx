import { useEffect, useState } from "react";
import { Collapse } from "@components/common/accordion";

interface Props {
  data: any;
}

const normalizeSpec = (specValue: unknown): any[] => {
  if (!specValue) {
    return [];
  }

  if (Array.isArray(specValue)) {
    return specValue;
  }

  if (typeof specValue === "object") {
    return Object.values(specValue as Record<string, unknown>);
  }

  if (typeof specValue === "string") {
    const trimmed = specValue.trim();
    if (!trimmed) {
      return [];
    }

    const firstChar = trimmed[0];
    if (firstChar === "{" || firstChar === "[") {
      try {
        const parsed = JSON.parse(trimmed);
        return normalizeSpec(parsed);
      } catch (error) {
        // fall through to treat the value as plain text below
      }
    }

    return trimmed
      .split(/\r?\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return [];
};

const ProductMetaReview: React.FC<Props> = ({ data }) => {
  const [metas, setMetas] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<number>(0);

  useEffect(() => {
    const specs = normalizeSpec(data?.spec);
    setMetas([
      {
        id: 1,
        title: "SPECS",
        content: specs,
      },
    ]);
  }, [data]);

  const renderContent = (content: any[]) => {
    if (!content || content.length === 0) {
      return <p className="text-sm text-gray-500">No specifications available.</p>;
    }

    return (
      <ul className="list-disc ml-6">
        {content.map((item: any, index: number) => {
          if (item === null || item === undefined) {
            return null;
          }

          if (typeof item === "string") {
            return <li key={index}>{item}</li>;
          }

          if (typeof item === "object") {
            const value =
              Object.prototype.hasOwnProperty.call(item, "spectValue")
                ? item.spectValue
                : Object.values(item).join(" ");
            return <li key={index}>{value}</li>;
          }

          return <li key={index}>{String(item)}</li>;
        })}
      </ul>
    );
  };

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
              <>{renderContent(item.content)}</>
            ) : (
              item.content
            )
          }
          expanded={expanded}
          setExpanded={setExpanded}
          variant="transparent"
        />
      ))}
    </>
  );
};

export default ProductMetaReview;
