import Link from "@components/ui/link";
import Image from "next/image";
import { useWindowSize } from "@utils/use-window-size";
import cn from "classnames";
import { LinkProps } from "next/link";
import { useSsrCompatible } from "@utils/use-ssr-compatible";
import { motion } from "framer-motion";
import { useState } from "react";
interface BannerProps {
  banner: any;
  variant?: "rounded" | "default";
  effectActive?: boolean;
  className?: string;
  classNameInner?: string;
  href: LinkProps["href"];
  disableBorderRadius?: boolean;
}

function getImage(deviceWidth: number, imgObj: any) {
  return deviceWidth < 768 ? imgObj.mobile : imgObj.desktop;
}

export default function BannerCard({
  banner,
  className,
  variant = "rounded",
  effectActive = false,
  classNameInner,
  href,
  disableBorderRadius = false,
}: BannerProps) {
  const { width } = useSsrCompatible(useWindowSize(), {
    width: 0,
    height: 0,
  });
  
  const { title, image } = banner;
  const selectedImage = getImage(width, image);
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={cn("mx-auto", className)}>
      <Link
        href={href}
        className={cn("h-full group flex justify-center relative overflow-hidden", classNameInner)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={loaded ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn("bg-gray-300 object-cover", {
            "rounded-md": variant === "rounded" && !disableBorderRadius,
          })}
        >
          <Image
            src={selectedImage.url}
            width={selectedImage.width}
            height={selectedImage.height}
            alt={title}
            quality={100}
            className="w-full h-auto object-cover"
            onLoad={() => setLoaded(true)}
            loading="eager"
            priority={false}
          />
        </motion.div>

        {effectActive && (
          <div className="absolute top-0 ltr:-left-[100%] rtl:-right-[100%] h-full w-1/2 z-5 block transform ltr:-skew-x-12 rtl:skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 ltr:group-hover:animate-shine rtl:group-hover:animate-shineRTL" />
        )}
      </Link>
    </div>
  );
}
