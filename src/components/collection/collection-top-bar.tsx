import { motion } from "framer-motion";
import { ProductGrid } from "@components/product/product-grid";

const CollectionTopBar = () => {
  const imagesBanner = [
    { id: 1, src: 'https://tatgolf.pumagolfvn.com/wp-content/uploads/2025/03/25SS_Ecom_GO_Apparel_PLP-collage-sm-template-img1-884x1000_600x.webp' },
    { id: 2, src: 'https://tatgolf.pumagolfvn.com/wp-content/uploads/2025/03/25SS_Ecom_GO_Apparel_PLP-collage-sm-template-img3-884x752_600x.webp' },
    { id: 3, src: 'https://tatgolf.pumagolfvn.com/wp-content/uploads/2025/03/25SS_Ecom_GO_Apparel_PLP-collage-sm-template-img5-884x1136_600x.webp' },
    { id: 4, src: 'https://tatgolf.pumagolfvn.com/wp-content/uploads/2025/03/25SS_Ecom_GO_Apparel_PLP-collage-sm-template-img2-884x663_600x.jpg' },
    { id: 5, src: 'https://tatgolf.pumagolfvn.com/wp-content/uploads/2025/03/25SS_Ecom_GO_Apparel_PLP-collage-sm-template-img4-884x911_600x.webp' },
    { id: 6, src: 'https://tatgolf.pumagolfvn.com/wp-content/uploads/2025/03/25SS_Ecom_GO_Apparel_PLP-collage-sm-template-img6_7-426x527_600x.webp' },
  ]
  return (
    <div className="min-h-screen text-gray-900">
      {/* Header with Logo */}
      <header className="py-6 px-10 bg-white shadow-md flex justify-center">
        <img src="https://tatgolf.pumagolfvn.com/wp-content/uploads/2024/03/ap_collab_logo-Puma-min_400x.png" alt="Brand Logo" />
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
            CHEERS TO THE KING
          </motion.h2>
          <motion.p
            className="text-base mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            The Puma x Arnold Palmer collection captures the essence of golfs global icon and pays homage to the Kings iconic style with a contemporary twist.
          </motion.p>
        </div>


        {/* Image Section */}
        <ul className="grid grid-cols-3 gap-4 mb-10">
          <li>
            <img src={imagesBanner[0].src} alt="Image 1" className="w-full object-cover rounded-lg shadow-md mb-4" />
            <img src={imagesBanner[3].src} alt="Image 1" className="w-full  object-cover rounded-lg shadow-md" />
          </li>
          <li>
            <img src={imagesBanner[1].src} alt="Image 1" className="w-full  object-cover rounded-lg shadow-md mb-4" />
            <img src={imagesBanner[4].src} alt="Image 1" className="w-full  object-cover rounded-lg shadow-md" />
          </li>
          <li>
            <img src={imagesBanner[2].src} alt="Image 1" className="w-full  object-cover rounded-lg shadow-md mb-4" />
            <img src={imagesBanner[5].src} alt="Image 1" className="w-full  object-cover rounded-lg shadow-md" />
          </li>
        </ul>

        {/* Related Products */}
        <h3 className="text-2xl font-bold mb-4">BỘ SƯU TẬP ARNOLD PALMER</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <ProductGrid />
        </div>
      </main>
    </div>
  );
};

export default CollectionTopBar;
