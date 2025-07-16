import Link from "@components/ui/link";
import Image from "next/image";
import { FaLink } from "react-icons/fa";
import { LinkProps } from "next/link";

interface Props {
  item: any;
  variant?: "rounded" | "circle";
  size?: "small" | "medium";
  imgSize?: "large";
  effectActive?: boolean;
  href: LinkProps["href"];
  showName?: boolean;
  disableBorderRadius?: boolean;
}

const Card: React.FC<Props> = ({
  item,
  variant = "circle",
  size = "small",
  effectActive = false,
  href,
  imgSize,
  disableBorderRadius = false,
}) => {
  console.log(item);
  
  const { name, image } = item;
  const imageSize: any =
    (imgSize === "large" && 375) ||
    (size === "small" && 180) ||
    (size === "medium" && 198);
  return (
    <Link
      href={href}
      className="group flex justify-center text-center flex-col"
    >
      {/* disableBorderRadius===false && (variant === 'rounded' ? 'rounded-md' : 'rounded-full') */}
      <div
        className={`relative inline-flex mb-3.5 md:mb-4 lg:mb-5 xl:mb-6 mx-auto ${
          !disableBorderRadius &&
          (variant === "rounded" ? "rounded-md" : "rounded-full")
        }`}
      >
        <div className="flex">
          <Image
            src={item.image ?? "/images/brand-placeholder.jpg"}
            alt={name || "image"}
            width={imageSize}
            height={imageSize}
            quality={100}
            loading="lazy"
            fetchPriority="low"
            className={`object-cover bg-white ${
              !disableBorderRadius &&
              (variant === "rounded" ? "rounded-md" : "rounded-full")
            }`}
          />
        </div>
        {effectActive === true && (
          <>
            <div
              className={`absolute top left bg-black w-full h-full opacity-0 transition-opacity duration-300 group-hover:opacity-30 ${
                !disableBorderRadius &&
                (variant === "rounded" ? "rounded-md" : "rounded-full")
              }`}
            />
            <div className="absolute top left h-full w-full flex items-center justify-center">
              <FaLink className="text-white text-base sm:text-xl lg:text-2xl xl:text-3xl transform opacity-0 scale-0 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:scale-100" />
            </div>
          </>
        )}
      </div>
    </Link>
  );
};

export default Card;
