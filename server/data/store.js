/**
 * In-Memory Data Store
 *
 * For production, replace with a proper database (PostgreSQL, MongoDB, etc.)
 * The store interface is designed to be easily swapped out for a real DB layer.
 */

const { v4: uuidv4 } = require("uuid");

// ─── In-Memory Collections ────────────────────────────────────────────────────
const groups = new Map();
const itineraries = new Map();
const votes = new Map();

// ─── Group Operations ─────────────────────────────────────────────────────────
const groupStore = {
  create(data) {
    const id = uuidv4();
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const group = {
      id,
      inviteCode,
      name: data.name,
      description: data.description || "",
      destinations: data.destinations || [],
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      budget: data.budget || { total: 0, currency: "USD", perPerson: 0 },
      members: data.members || [],
      creator: data.creator,
      status: "planning", // planning | confirmed | completed
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    groups.set(id, group);
    return group;
  },

  findById(id) {
    return groups.get(id) || null;
  },

  findByInviteCode(code) {
    for (const group of groups.values()) {
      if (group.inviteCode === code.toUpperCase()) return group;
    }
    return null;
  },

  findAll() {
    return Array.from(groups.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  },

  update(id, updates) {
    const group = groups.get(id);
    if (!group) return null;
    const updated = { ...group, ...updates, updatedAt: new Date().toISOString() };
    groups.set(id, updated);
    return updated;
  },

  addMember(id, member) {
    const group = groups.get(id);
    if (!group) return null;
    const exists = group.members.find((m) => m.email === member.email);
    if (exists) return group;
    const newMember = {
      id: uuidv4(),
      name: member.name,
      email: member.email,
      role: member.role || "member",
      joinedAt: new Date().toISOString(),
      preferences: member.preferences || {},
    };
    group.members.push(newMember);
    group.updatedAt = new Date().toISOString();
    groups.set(id, group);
    return group;
  },

  removeMember(groupId, memberId) {
    const group = groups.get(groupId);
    if (!group) return null;
    group.members = group.members.filter((m) => m.id !== memberId);
    group.updatedAt = new Date().toISOString();
    groups.set(groupId, group);
    return group;
  },

  delete(id) {
    return groups.delete(id);
  },
};

// ─── Itinerary Operations ─────────────────────────────────────────────────────
const itineraryStore = {
  save(groupId, data) {
    const itinerary = {
      id: uuidv4(),
      groupId,
      destination: data.destination,
      days: data.days || [],
      summary: data.summary || "",
      highlights: data.highlights || [],
      tips: data.tips || [],
      estimatedCosts: data.estimatedCosts || {},
      generatedAt: new Date().toISOString(),
    };
    itineraries.set(groupId, itinerary);
    return itinerary;
  },

  findByGroupId(groupId) {
    return itineraries.get(groupId) || null;
  },

  delete(groupId) {
    return itineraries.delete(groupId);
  },
};

// ─── Vote Operations ──────────────────────────────────────────────────────────
const voteStore = {
  initPoll(groupId, destinations) {
    const poll = {
      id: uuidv4(),
      groupId,
      destinations: destinations.map((d) => ({
        name: d,
        votes: [],
        count: 0,
      })),
      createdAt: new Date().toISOString(),
    };
    votes.set(groupId, poll);
    return poll;
  },

  castVote(groupId, destination, voterId) {
    const poll = votes.get(groupId);
    if (!poll) return null;

    // Remove existing vote from this voter
    poll.destinations.forEach((d) => {
      d.votes = d.votes.filter((v) => v !== voterId);
      d.count = d.votes.length;
    });

    // Add new vote
    const dest = poll.destinations.find((d) => d.name === destination);
    if (!dest) return null;
    dest.votes.push(voterId);
    dest.count = dest.votes.length;
    votes.set(groupId, poll);
    return poll;
  },

  findByGroupId(groupId) {
    return votes.get(groupId) || null;
  },
};

module.exports = { groupStore, itineraryStore, voteStore };
