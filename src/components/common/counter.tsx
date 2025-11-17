import MinusIcon from "@components/icons/minus-icon";
import PlusIcon from "@components/icons/plus-icon";
import cn from "classnames";
type CounterProps = {
	quantity: number;
	onDecrement: (e: any) => void;
	onIncrement: (e: any) => void;
	disableIncrement?: boolean;
	disableDecrement?: boolean;
	variant?: "default" | "dark";
	className?: string;
	quantityInput?: string;
	onInputChange?: (value: string) => void;
	onInputBlur?: () => void;
	inputAriaLabel?: string;
};
const Counter: React.FC<CounterProps> = ({
	quantity,
	onDecrement,
	onIncrement,
	disableIncrement = false,
	disableDecrement = false,
	variant = "default",
	quantityInput,
	onInputChange,
	onInputBlur,
	inputAriaLabel,
}) => {
	const size = variant !== "dark" ? "12px" : "10px";
	const displayValue =
		quantityInput !== undefined ? quantityInput : String(quantity);
	return (
		<div
			className={cn(
				"group flex items-center justify-between rounded-md overflow-hidden flex-shrink-0",
				{
					"border h-11 md:h-12 border-gray-300": variant === "default",
					"h-8 md:h-9 shadow-navigation bg-heading": variant === "dark",
				}
			)}
		>
			<button
				onClick={onDecrement}
				className={cn(
					"flex items-center justify-center flex-shrink-0 h-full transition ease-in-out duration-300 focus:outline-none",
					{
						"w-10 md:w-12 text-heading border-e border-gray-300 hover:text-white hover:bg-heading":
							variant === "default",
						"w-8 md:w-9 text-white bg-heading hover:bg-gray-600 focus:outline-none":
							variant === "dark",
					}
				)}
				disabled={disableDecrement}
			>
				<MinusIcon width={size} />
			</button>
			{onInputChange ? (
				<input
					type="text"
					inputMode="numeric"
					pattern="[0-9]*"
					value={displayValue}
					onChange={(e) => onInputChange?.(e.target.value)}
					onBlur={onInputBlur}
					aria-label={inputAriaLabel ?? "Quantity"}
					className={cn(
						"font-semibold flex items-center justify-center h-full transition-colors duration-250 ease-in-out flex-shrink-0 text-center outline-none",
						{
							"text-base text-heading w-12 md:w-20 xl:w-24 bg-transparent":
								variant === "default",
							"text-sm text-white w-8 md:w-10 bg-transparent": variant === "dark",
						}
					)}
				/>
			) : (
			<span
				className={cn(
					"font-semibold flex items-center justify-center h-full  transition-colors duration-250 ease-in-out cursor-default flex-shrink-0",
					{
						"text-base text-heading w-12  md:w-20 xl:w-24":
							variant === "default",
						"text-sm text-white w-8 md:w-10 ": variant === "dark",
					}
				)}
			>
				{quantity}
			</span>
			)}

			<button
				onClick={onIncrement}
				className={cn(
					"flex items-center justify-center h-full flex-shrink-0 transition ease-in-out duration-300 focus:outline-none",
					{
						"w-10 md:w-12 text-heading border-s border-gray-300 hover:text-white hover:bg-heading":
							variant === "default",
						"w-8 md:w-9 text-white bg-heading hover:bg-gray-600 focus:outline-none":
							variant === "dark",
					}
				)}
				disabled={disableIncrement}
			>
				<PlusIcon width={size} height={size} />
			</button>
		</div>
	);
};
export default Counter;
