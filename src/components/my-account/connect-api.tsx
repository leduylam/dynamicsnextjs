import { motion } from "framer-motion";
import { fadeInTop } from "@utils/motion/fade-in-top";

type ConnectApiProps = {
  apiKey: any | null;
  error?: string | null;
};

const ConnectApi = ({ apiKey, error }: ConnectApiProps) => {
  const hasCredentials = Boolean(apiKey?.api_key?.client_id && apiKey?.api_key?.client_secret);

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
        className="w-full flex h-full lg:w-8/12 flex-col"
            >
        {hasCredentials ? (
          <>
                <div className="mb-5 flex items-center gap-3">
                    <h2 className="font-semibold">AppId:</h2>
              <p className="bg-black text-white px-2 pt-1">
                {apiKey.api_key.client_id}
              </p>
                </div>
                <div className="flex items-center gap-3">
                    <h2 className="font-semibold">Secret:</h2>
              <p className="bg-black text-white px-2 pt-1">
                {apiKey.api_key.client_secret}
              </p>
            </div>
          </>
        ) : (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-6 text-sm text-body">
            {error ?? "We couldn’t load your API credentials. Please try again later."}
                </div>
        )}
            </motion.div>
        </>
    );
};

export default ConnectApi;
