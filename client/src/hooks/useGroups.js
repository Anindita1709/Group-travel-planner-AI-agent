import { useCallback, useState } from "react";
import { groupsApi } from "../services/api";

/**
 * useGroups — Hook for group-level data fetching and mutations.
 * Separates data-fetching concerns from the global context,
 * useful for components that need localised group state.
 */
export function useGroups() {
  const [votes, setVotes] = useState(null);
  const [votesLoading, setVotesLoading] = useState(false);

  const fetchVotes = useCallback(async (groupId) => {
    setVotesLoading(true);
    try {
      const res = await groupsApi.getVotes(groupId);
      setVotes(res.data);
      return res.data;
    } catch {
      return null;
    } finally {
      setVotesLoading(false);
    }
  }, []);

  const castVote = useCallback(async (groupId, destination, voterId) => {
    try {
      const res = await groupsApi.castVote(groupId, { destination, voterId });
      setVotes(res.data);
      return res.data;
    } catch (err) {
      throw err;
    }
  }, []);

  return { votes, votesLoading, fetchVotes, castVote };
}

export default useGroups;
