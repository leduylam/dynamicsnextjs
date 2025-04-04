import Link from "@components/ui/link";
import { useUI } from "@contexts/ui.context";
import Image from "next/image";

export default function Newsletter() {
  const { closeModal } = useUI()
  const handleClick = () => {
    closeModal()
  }
  return (
    <div className="flex items-center justify-center">
      <div className="w-full sm:w-[450px] md:w-[550px] lg:w-[980px] xl:w-[1170px]  flex flex-col max-w-full max-h-full bg-white overflow-hidden rounded-md">
        <div className="relative flex items-center justify-center w-full rounded-md overflow-hidden">
          <Image
            src="/assets/images/gn-banner.jpg"
            alt="Thumbnail"
            width={655}
            height={655}
            className=" w-full h-full"
          />
          {/* <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-40"></div> */}
          <div className="absolute flex flex-col items-center justify-center text-center px-5 sm:px-10 w-full">
            <div className="w-[150px] md:w-[220px] mb-2 sm:mb-3 md:mb-9 hidden lg:block">
              <Image
                src="/assets/images/gn-main-logo.webp"
                alt="Thumbnail"
                width={655}
                height={655}
              />
            </div>
            <h2 className="text-red-600 text-lg sm:text-xl md:text-3xl leading-8 font-bold mb-2 sm:mb-3 md:mb-5 uppercase">
              Clearence Sale
            </h2>
            <p className="text-heading text-lg leading-6 md:leading-7">
              Up to <span className="text-red-500 font-semibold text-4xl">50%</span>
            </p>
            <Link href={`search?brand=greg-norman`}
              onClick={handleClick}
              className="bg-white hover:bg-blue-600 hover:text-white px-2 py-1 md:px-5 md:py-3 mt-4 text-sm md:text-base transition-all rounded-md uppercase md:font-bold "
            >
              Buy now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
