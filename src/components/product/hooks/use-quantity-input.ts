import { useCallback, useEffect, useMemo, useState } from "react";

type UseQuantityInputOptions = {
  initial?: number;
  min?: number;
  max?: number;
};

export const useQuantityInput = ({
  initial = 1,
  min = 1,
  max,
}: UseQuantityInputOptions = {}) => {
  const clamp = useCallback(
    (value: number) => {
      if (!Number.isFinite(value)) {
        return min;
      }
      let next = Math.floor(value);
      if (next < min) {
        next = min;
      }
      if (typeof max === "number" && max > 0) {
        next = Math.min(next, max);
      }
      return next;
    },
    [min, max]
  );

  const [quantity, setQuantityState] = useState(() => clamp(initial));
  const [inputValue, setInputValue] = useState(() => String(clamp(initial)));

  const syncQuantity = useCallback(
    (value: number) => {
      const next = clamp(value);
      setQuantityState(next);
      setInputValue(String(next));
      return next;
    },
    [clamp]
  );

  useEffect(() => {
    syncQuantity(initial);
  }, [initial, syncQuantity]);

  useEffect(() => {
    setQuantityState((prev) => {
      const next = clamp(prev);
      if (next !== prev) {
        setInputValue(String(next));
      }
      return next;
    });
  }, [clamp]);

  const increment = useCallback(() => {
    setQuantityState((prev) => {
      const next = clamp(prev + 1);
      setInputValue(String(next));
      return next;
    });
  }, [clamp]);

  const decrement = useCallback(() => {
    setQuantityState((prev) => {
      const next = clamp(prev - 1);
      setInputValue(String(next));
      return next;
    });
  }, [clamp]);

  const handleInputChange = useCallback(
    (raw: string) => {
      const sanitized = raw.replace(/[^\d]/g, "");
      if (!sanitized) {
        syncQuantity(min);
        return;
      }
      const parsed = parseInt(sanitized, 10);
      syncQuantity(Number.isNaN(parsed) ? min : parsed);
    },
    [min, syncQuantity]
  );

  const handleInputBlur = useCallback(() => {
    syncQuantity(quantity);
  }, [quantity, syncQuantity]);

  const disableDecrement = useMemo(() => quantity <= min, [quantity, min]);
  const disableIncrement = useMemo(() => {
    if (typeof max !== "number" || max <= 0) return false;
    return quantity >= max;
  }, [quantity, max]);

  return {
    quantity,
    inputValue,
    increment,
    decrement,
    handleInputChange,
    handleInputBlur,
    disableDecrement,
    disableIncrement,
    setQuantity: syncQuantity,
    min,
    max,
  };
};

export default useQuantityInput;

