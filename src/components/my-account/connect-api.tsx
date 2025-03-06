import { motion } from "framer-motion";
import { fadeInTop } from "@utils/motion/fade-in-top";

const ConnectApi = ({ apiKey }: any) => {
    return (
        <>
            <h2 className="text-lg md:text-xl xl:text-2xl font-bold text-heading mb-6 xl:mb-8">
                Connect api
            </h2>
            <motion.div
                layout
                initial="from"
                animate="to"
                exit="from"
                //@ts-ignore
                variants={fadeInTop(0.35)}
                className={`w-full flex  h-full lg:w-8/12 flex-col`}
            >
                <div className="mb-5 flex gap-3">
                    <h2 className="font-semibold">AppId:</h2>
                    <p>{apiKey?.client_id}</p>
                </div>
                <div className="flex gap-3">
                    <h2 className="font-semibold">Secret</h2>
                    <p>{apiKey?.client_secret}</p>
                </div>
            </motion.div>
        </>
    );
};

export default ConnectApi;
