import Button from "@components/ui/button";
import Image from "next/image";

export default function Newsletter() {
  return (
    <div className="flex items-center justify-center">
      <div className="w-full sm:w-[450px] md:w-[550px] lg:w-[980px] xl:w-[1170px] flex flex-col max-w-full max-h-full bg-white overflow-hidden rounded-md">
        <div className="flex items-center">
          <div className="flex-shrink-0 items-center justify-center bg-gray-200 hidden lg:flex lg:w-[520px] xl:w-[655px]">
            <Image
              src="/assets/images/newsletter.jpg"
              alt="Thumbnail"
              width={655}
              height={655}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex flex-col px-5 py-7 sm:p-10 md:p-12 xl:p-14 text-center w-full">
            <h2 className="text-heading text-lg sm:text-xl md:text-2xl leading-8 font-bold mb-5 sm:mb-7 md:mb-9">
              And Get Offer On New Collection
            </h2>
            <p className="text-body text-sm leading-6 md:leading-7">
              Do subscribe the ChawkBazar to receive updates on new arrivals, special offers & our promotions
            </p>
            <Button className="w-full h-12 lg:h-14 mt-3 sm:mt-4">
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
