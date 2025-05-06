import { useEffect, useRef, useState } from "react";

export function useLazyRender(offset = "0px") {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.unobserve(ref.current!);
        }
      },
      {
        root: null,
        rootMargin: offset,
        threshold: 0,
      }
    );

    observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return { ref, visible };
}
