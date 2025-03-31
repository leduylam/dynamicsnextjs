import { motion } from "framer-motion";
import { useEffect, useState } from "react";
interface ImageBanner {
  id: number;
  src: string;
}
const CollectionTopBar = ({ data }: any) => {
  const [imagesBanner, setImageBanner] = useState<ImageBanner[]>([])

  useEffect(() => {
    if (data && data.images) {
      const formattedImages = data.images.map((image: { url: string }, index: number) => ({
        id: index + 1,
        src: image.url,
      }));
      setImageBanner(formattedImages)
    }
  }, [data])

  return (
    <div className="min-h-screen text-gray-900">
      {/* Header with Logo */}
      <header className="py-6 px-10 bg-white shadow-md flex justify-center">
        <img src={`${process.env.NEXT_PUBLIC_SITE_URL}/${data.image}`} alt="Brand Logo" />
      </header>

      {/* Title */}
      <main className="flex flex-col items-center text-center py-10 px-6">
        <div className="mb-20 w-2/3">
          <motion.h2
            className="text-4xl font-extrabold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {data.title}
          </motion.h2>
          <motion.p
            className="text-base mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {data.description}
          </motion.p>
        </div>


        {/* Image Section */}
        <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <li>
            <img src={imagesBanner ? `${process.env.NEXT_PUBLIC_SITE_URL}/${imagesBanner[0]?.src}` : ''} alt="Image 1" className="w-full object-cover rounded-lg shadow-md mb-4" />
            {imagesBanner && imagesBanner[3]?.src && (
              <img src={imagesBanner ? `${process.env.NEXT_PUBLIC_SITE_URL}/${imagesBanner[3]?.src}` : ''} alt="Image 1" className="w-full object-cover rounded-lg shadow-md" />
            )}
          </li>
          <li>
            <img src={imagesBanner ? `${process.env.NEXT_PUBLIC_SITE_URL}/${imagesBanner[1]?.src}` : ''} alt="Image 1" className="w-full  object-cover rounded-lg shadow-md mb-4" />
            {imagesBanner && imagesBanner[4]?.src && (
              <img src={imagesBanner ? `${process.env.NEXT_PUBLIC_SITE_URL}/${imagesBanner[4]?.src}` : ''} alt="Image 1" className="w-full  object-cover rounded-lg shadow-md" />
            )}
          </li>
          <li className="hidden lg:block">
            <img src={imagesBanner ? `${process.env.NEXT_PUBLIC_SITE_URL}/${imagesBanner[2]?.src}` : ''} alt="Image 1" className="w-full  object-cover rounded-lg shadow-md mb-4" />
            {imagesBanner && imagesBanner[5]?.src && (
              <img src={imagesBanner ? `${process.env.NEXT_PUBLIC_SITE_URL}/${imagesBanner[5]?.src}` : ''} alt="Image 1" className="w-full  object-cover rounded-lg shadow-md" />
            )}
          </li>
        </ul>
        {/* Related Products */}
        <h3 className="text-2xl font-bold mb-4">{data.name} COLLECTION</h3>
      </main>
    </div>
  );
};

export default CollectionTopBar;
