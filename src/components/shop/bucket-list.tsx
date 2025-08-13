import { CheckBox } from "@components/ui/checkbox";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
type BucketListProps = {
  data: any;
  formState: Record<string, string[]>;
  toggleValue: (group: string, value: string) => void;
};
interface OpenBuckets {
  [bucket: string]: boolean;
}
export default function BucketList({
  data,
  formState,
  toggleValue,
}: BucketListProps) {
  const [openBuckets, setOpenBuckets] = useState<OpenBuckets>({});

  const toggleBucket = (bucket: string) => {
    setOpenBuckets((prev: OpenBuckets) => ({
      ...prev,
      [bucket]: !prev[bucket],
    }));
  };
  return (
    <>
      {Object.entries(data).map(([bucket, list]) => {
        const isOpen = openBuckets[bucket] ?? true; // mặc định mở
        const items = list as string[]; // assert type
        return (
          <div key={bucket} className="ml-2 border-b pb-2">
            {/* Tiêu đề bucket */}
            <div
              className="text-sm font-semibold mb-2 opacity-70 flex items-center justify-between cursor-pointer"
              onClick={() => toggleBucket(bucket)}
            >
              <span>{bucket}</span>
              <span className="text-xs">{isOpen ? "▲" : "▼"}</span>
            </div>

            {/* Nội dung collapse */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial="collapsed"
                  animate="open"
                  exit="collapsed"
                  variants={{
                    open: { height: "auto", opacity: 1 },
                    collapsed: { height: 0, opacity: 0 },
                  }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  style={{ overflow: "hidden" }}
                  className="flex flex-col space-y-3"
                >
                  {items.map((val) => {
                    const g = "size";
                    const checked = (formState[g] ?? []).includes(val);
                    return (
                      <CheckBox
                        key={`${bucket}-${val}`}
                        label={<span className="flex items-center">{val}</span>}
                        name={g}
                        checked={checked}
                        value={val}
                        onChange={() => toggleValue("size", val)}
                      />
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </>
  );
}
