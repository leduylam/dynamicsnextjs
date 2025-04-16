import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

type LightboxProps = {
    images: string[];
    initialIndex: number;
    onClose: () => void;
};

import { useState } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const Lightbox = ({ images, initialIndex, onClose }: LightboxProps) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
        );
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);


    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[1000]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div
                    className="relative flex items-center justify-center w-full h-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    <img
                        src={images[currentIndex]}
                        alt={`lightbox-${currentIndex}`}
                        className="max-w-full max-h-full rounded-lg shadow-lg"
                    />
                    {/* Prev */}
                    <button
                        onClick={handlePrev}
                        className="absolute left-6 text-white text-3xl font-bold p-4 bg-blue-600 bg-opacity-50 rounded hover:bg-opacity-70"
                    >
                        <FaArrowLeft />
                    </button>

                    {/* Next */}
                    <button
                        onClick={handleNext}
                        className="absolute right-6 text-white text-3xl font-bold p-4 bg-blue-600 bg-opacity-50 rounded hover:bg-opacity-70"
                    >
                        <FaArrowRight />
                    </button>

                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-white text-3xl font-bold"
                    >
                        &times;
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>

    );
};

export default Lightbox;