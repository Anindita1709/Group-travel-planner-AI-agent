import { createContext, useContext, useReducer, useCallback } from "react";
import { groupsApi, itineraryApi } from "../services/api";

// ─── State Shape ──────────────────────────────────────────────────────────────
const initialState = {
  groups: [],
  currentGroup: null,
  currentItinerary: null,
  loading: { groups: false, group: false, itinerary: false },
  error: null,
  notification: null,
};

// ─── Action Types ─────────────────────────────────────────────────────────────
const ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_GROUPS: "SET_GROUPS",
  SET_CURRENT_GROUP: "SET_CURRENT_GROUP",
  ADD_GROUP: "ADD_GROUP",
  UPDATE_GROUP: "UPDATE_GROUP",
  REMOVE_GROUP: "REMOVE_GROUP",
  SET_ITINERARY: "SET_ITINERARY",
  SET_NOTIFICATION: "SET_NOTIFICATION",
  CLEAR_NOTIFICATION: "CLEAR_NOTIFICATION",
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function travelReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: { ...state.loading, ...action.payload } };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTIONS.SET_GROUPS:
      return { ...state, groups: action.payload };
    case ACTIONS.SET_CURRENT_GROUP:
      return { ...state, currentGroup: action.payload };
    case ACTIONS.ADD_GROUP:
      return { ...state, groups: [action.payload, ...state.groups] };
    case ACTIONS.UPDATE_GROUP:
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === action.payload.id ? action.payload : g
        ),
        currentGroup:
          state.currentGroup?.id === action.payload.id
            ? action.payload
            : state.currentGroup,
      };
    case ACTIONS.REMOVE_GROUP:
      return {
        ...state,
        groups: state.groups.filter((g) => g.id !== action.payload),
      };
    case ACTIONS.SET_ITINERARY:
      return { ...state, currentItinerary: action.payload };
    case ACTIONS.SET_NOTIFICATION:
      return { ...state, notification: action.payload };
    case ACTIONS.CLEAR_NOTIFICATION:
      return { ...state, notification: null };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const TravelContext = createContext(null);

export function TravelProvider({ children }) {
  const [state, dispatch] = useReducer(travelReducer, initialState);

  const notify = useCallback((message, type = "success") => {
    dispatch({ type: ACTIONS.SET_NOTIFICATION, payload: { message, type } });
    setTimeout(() => dispatch({ type: ACTIONS.CLEAR_NOTIFICATION }), 4000);
  }, []);

  const fetchGroups = useCallback(async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: { groups: true } });
    try {
      const res = await groupsApi.getAll();
      dispatch({ type: ACTIONS.SET_GROUPS, payload: res.data });
    } catch (err) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: err.message });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { groups: false } });
    }
  }, []);

  const fetchGroup = useCallback(async (id) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: { group: true } });
    try {
      const res = await groupsApi.getById(id);
      dispatch({ type: ACTIONS.SET_CURRENT_GROUP, payload: res.data });
      return res.data;
    } catch (err) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: err.message });
      return null;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { group: false } });
    }
  }, []);

  const createGroup = useCallback(async (data) => {
    try {
      const res = await groupsApi.create(data);
      dispatch({ type: ACTIONS.ADD_GROUP, payload: res.data });
      notify("Travel group created! 🎉");
      return res.data;
    } catch (err) {
      notify(err.message, "error");
      throw err;
    }
  }, [notify]);

  const updateGroup = useCallback(async (id, data) => {
    try {
      const res = await groupsApi.update(id, data);
      dispatch({ type: ACTIONS.UPDATE_GROUP, payload: res.data });
      notify("Group updated!");
      return res.data;
    } catch (err) {
      notify(err.message, "error");
      throw err;
    }
  }, [notify]);

  const deleteGroup = useCallback(async (id) => {
    try {
      await groupsApi.delete(id);
      dispatch({ type: ACTIONS.REMOVE_GROUP, payload: id });
      notify("Group deleted");
    } catch (err) {
      notify(err.message, "error");
    }
  }, [notify]);

  const joinGroup = useCallback(async (code, memberData) => {
    try {
      const res = await groupsApi.join(code, memberData);
      dispatch({ type: ACTIONS.ADD_GROUP, payload: res.data });
      notify(`Joined "${res.data.name}"! 🎊`);
      return res.data;
    } catch (err) {
      notify(err.message, "error");
      throw err;
    }
  }, [notify]);

  const addMember = useCallback(async (groupId, memberData) => {
    try {
      const res = await groupsApi.addMember(groupId, memberData);
      dispatch({ type: ACTIONS.UPDATE_GROUP, payload: res.data });
      notify("Member added!");
      return res.data;
    } catch (err) {
      notify(err.message, "error");
      throw err;
    }
  }, [notify]);

  const fetchItinerary = useCallback(async (groupId) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: { itinerary: true } });
    try {
      const res = await itineraryApi.getByGroup(groupId);
      dispatch({ type: ACTIONS.SET_ITINERARY, payload: res.data });
      return res.data;
    } catch {
      dispatch({ type: ACTIONS.SET_ITINERARY, payload: null });
      return null;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { itinerary: false } });
    }
  }, []);

  const saveItinerary = useCallback(async (groupId, data) => {
    try {
      const res = await itineraryApi.save(groupId, data);
      dispatch({ type: ACTIONS.SET_ITINERARY, payload: res.data });
      notify("Itinerary saved! 🗺️");
      return res.data;
    } catch (err) {
      notify(err.message, "error");
      throw err;
    }
  }, [notify]);

  const value = {
    ...state,
    fetchGroups,
    fetchGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    joinGroup,
    addMember,
    fetchItinerary,
    saveItinerary,
    notify,
  };

  return <TravelContext.Provider value={value}>{children}</TravelContext.Provider>;
}

export function useTravelContext() {
  const ctx = useContext(TravelContext);
  if (!ctx) throw new Error("useTravelContext must be used inside TravelProvider");
  return ctx;
}
