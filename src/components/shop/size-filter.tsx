
import { CheckBox } from "@components/ui/checkbox";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
interface SizeFilterProps {
    title?: string;
    items?: any;
}
export const SizeFilter = ({ title, items }: SizeFilterProps) => {
    const router = useRouter();
    const { pathname, query } = router;
    const [formState, setFormState] = React.useState<Record<string, string[]>>({});
    const [colors, setColors] = useState<string[]>([])
    const [visibleCount, setVisibleCount] = useState(10);

    useEffect(() => {
        if (items && title === 'Color') {
            setColors(items.map((color: { value: any; }) => color.value))
        }
    }, [items, title])
    const splitColors = colors.flatMap(color =>
        color.split("-").map((part: string) => part.trim())
    );
    const uniqueColors = [...new Set(splitColors)];
    const showMore = () => {
        setVisibleCount((prevCount) => prevCount + 10);
    };
    React.useEffect(() => {
        Object.keys(query).forEach((key) => {
            const values = typeof query[key] === 'string' ? query[key].split(",") : [];
            setFormState((prevState) => ({
                ...prevState,
                [key]: values,
            }));
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    function handleItemClick(e: React.FormEvent<HTMLInputElement>, type: any): void {
        const { value } = e.currentTarget;
        const key = type.toLowerCase();
        const currentFormState = Array.isArray(formState[key])
            ? formState[key].includes(value)
                ? formState[key].filter((i) => i !== value)
                : [...formState[key], value]
            : [value];
        setFormState({
            ...formState,
            [key]: currentFormState
        });
        const { [key]: _, ...restQuery } = query;
        router.push(
            {
                pathname,
                query: {
                    ...restQuery,
                    ...(!!currentFormState.length
                        ? { [key]: currentFormState.join(",") }
                        : {}),
                },
            },
            undefined,
            { scroll: false }
        );
    }

    return (
        <div className="block border-b border-gray-300 pb-7">
            <h3 className="text-heading text-sm md:text-base font-semibold mb-7">
                {title}
            </h3>
            <div className="mt-2 flex flex-col space-y-4">
                {title === 'Color' ? (
                    <>
                        {uniqueColors.slice(0, visibleCount)?.map((item: any, index: number) => (
                            <CheckBox
                                key={index}
                                label={
                                    <span className="flex items-center">
                                        {item}
                                    </span>
                                }
                                name={title.toLowerCase()}
                                checked={Array.isArray(formState[title.toLowerCase()]) && formState[title.toLowerCase()]?.includes(item) || false}
                                value={item}
                                onChange={(e) => handleItemClick(e, title)}
                            />
                        ))}
                        {visibleCount < uniqueColors.length && (
                            <p className="text-sm mx-5 cursor-pointer italic hover:underline"
                                onClick={showMore}
                            >More ...</p>
                        )}
                    </>
                ) : (
                    <>
                        {items?.map((item: any) => (
                            <CheckBox
                                key={item.id}
                                label={
                                    <span className="flex items-center">
                                        {item.value}
                                    </span>
                                }
                                name={item.name.toLowerCase()}
                                checked={Array.isArray(formState[item.name.toLowerCase()]) && formState[item.name.toLowerCase()]?.includes(item.value) || false}
                                value={item.value}
                                onChange={(e) => handleItemClick(e, item.name)}
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};
