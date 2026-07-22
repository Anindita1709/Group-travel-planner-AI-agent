import axios from "axios";

const BASE_URL = "/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

// ─── Groups API ───────────────────────────────────────────────────────────────
export const groupsApi = {
  getAll: () => api.get("/groups"),
  getById: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post("/groups", data),
  update: (id, data) => api.put(`/groups/${id}`, data),
  delete: (id) => api.delete(`/groups/${id}`),
  join: (code, memberData) => api.post(`/groups/join/${code}`, memberData),
  addMember: (id, data) => api.post(`/groups/${id}/members`, data),
  removeMember: (groupId, memberId) => api.delete(`/groups/${groupId}/members/${memberId}`),
  getVotes: (id) => api.get(`/groups/${id}/votes`),
  castVote: (id, data) => api.post(`/groups/${id}/votes`, data),
};

// ─── Itinerary API ────────────────────────────────────────────────────────────
export const itineraryApi = {
  getByGroup: (groupId) => api.get(`/itinerary/${groupId}`),
  save: (groupId, data) => api.post(`/itinerary/${groupId}`, data),
  delete: (groupId) => api.delete(`/itinerary/${groupId}`),
};

// ─── AI API ───────────────────────────────────────────────────────────────────
export const aiApi = {
  suggestDestinations: (data) => api.post("/ai/suggest-destinations", data),
  packingList: (data) => api.post("/ai/packing-list", data),
  budgetBreakdown: (data) => api.post("/ai/budget-breakdown", data),
  chat: (data) => api.post("/ai/chat", data),

  // SSE streaming for itinerary generation
  generateItinerary: (data, onChunk, onComplete, onError) => {
    fetch(`${BASE_URL}/ai/generate-itinerary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((response) => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      function processChunk({ done, value }) {
        if (done) return;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.startsWith("data:")) {
            try {
              const json = JSON.parse(line.slice(5).trim());
              if (lines[i - 1]?.includes("event: chunk")) onChunk?.(json);
              if (lines[i - 1]?.includes("event: complete")) onComplete?.(json.itinerary);
              if (lines[i - 1]?.includes("event: error")) onError?.(json.message);
            } catch {}
          }
        }
        return reader.read().then(processChunk);
      }

      reader.read().then(processChunk);
    }).catch(onError);
  },
};
