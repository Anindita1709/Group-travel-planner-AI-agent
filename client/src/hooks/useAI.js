import { useState, useCallback } from "react";
import { aiApi } from "../services/api";

/**
 * useAI — Centralised hook for all AI-powered features.
 * Encapsulates loading state, error handling, and streaming logic
 * so pages stay clean.
 */
export function useAI() {
  const [loading, setLoading] = useState({
    destinations: false,
    itinerary: false,
    packing: false,
    budget: false,
    chat: false,
  });
  const [error, setError] = useState(null);
  const [streamText, setStreamText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const clearError = () => setError(null);

  const withLoading = useCallback(async (key, fn) => {
    setLoading((l) => ({ ...l, [key]: true }));
    setError(null);
    try {
      return await fn();
    } catch (err) {
      setError(err.message || "Something went wrong");
      return null;
    } finally {
      setLoading((l) => ({ ...l, [key]: false }));
    }
  }, []);

  // ─── Suggest Destinations ─────────────────────────────────────────────────
  const suggestDestinations = useCallback(
    (params) =>
      withLoading("destinations", async () => {
        const res = await aiApi.suggestDestinations(params);
        return res.data;
      }),
    [withLoading]
  );

  // ─── Generate Itinerary (streaming) ───────────────────────────────────────
  const generateItinerary = useCallback(
    (params) =>
      new Promise((resolve, reject) => {
        setIsStreaming(true);
        setStreamText("");
        setError(null);
        setLoading((l) => ({ ...l, itinerary: true }));

        aiApi.generateItinerary(
          params,
          (chunk) => setStreamText((t) => t + (chunk.text || "")),
          (itinerary) => {
            setIsStreaming(false);
            setLoading((l) => ({ ...l, itinerary: false }));
            resolve(itinerary);
          },
          (err) => {
            setIsStreaming(false);
            setLoading((l) => ({ ...l, itinerary: false }));
            setError(String(err));
            reject(new Error(String(err)));
          }
        );
      }),
    []
  );

  // ─── Packing List ─────────────────────────────────────────────────────────
  const generatePackingList = useCallback(
    (params) =>
      withLoading("packing", async () => {
        const res = await aiApi.packingList(params);
        return res.data;
      }),
    [withLoading]
  );

  // ─── Budget Breakdown ─────────────────────────────────────────────────────
  const analyzeBudget = useCallback(
    (params) =>
      withLoading("budget", async () => {
        const res = await aiApi.budgetBreakdown(params);
        return res.data;
      }),
    [withLoading]
  );

  // ─── Chat ─────────────────────────────────────────────────────────────────
  const chat = useCallback(
    (params) =>
      withLoading("chat", async () => {
        const res = await aiApi.chat(params);
        return res.data;
      }),
    [withLoading]
  );

  return {
    loading,
    error,
    clearError,
    streamText,
    isStreaming,
    suggestDestinations,
    generateItinerary,
    generatePackingList,
    analyzeBudget,
    chat,
  };
}

export default useAI;
