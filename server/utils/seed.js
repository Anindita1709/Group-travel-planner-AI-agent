/**
 * Seed Script — populates the in-memory store with demo data.
 * Run alongside the server in development to explore the app
 * without clicking through every form.
 *
 * Usage: the main server imports this automatically in development.
 *        Or run standalone: node server/utils/seed.js
 */

const { groupStore, voteStore, itineraryStore } = require("../data/store");

function seed() {
  // ── Group 1: Europe Summer ──────────────────────────────────────────────────
  const euro = groupStore.create({
    name: "Euro Summer '25 🌍",
    description: "Epic 2-week tour across the continent with the squad",
    creator: "Alex Chen",
    destinations: ["Paris, France", "Barcelona, Spain", "Rome, Italy"],
    startDate: "2025-07-10",
    endDate: "2025-07-24",
    budget: { total: 12000, currency: "USD", perPerson: 3000 },
    status: "planning",
    members: [],
  });
  groupStore.addMember(euro.id, { name: "Alex Chen", email: "alex@example.com", role: "organizer" });
  groupStore.addMember(euro.id, { name: "Priya Sharma", email: "priya@example.com", role: "member" });
  groupStore.addMember(euro.id, { name: "Marcus Johnson", email: "marcus@example.com", role: "member" });
  groupStore.addMember(euro.id, { name: "Sofia Kowalski", email: "sofia@example.com", role: "member" });
  voteStore.initPoll(euro.id, ["Paris, France", "Barcelona, Spain", "Rome, Italy"]);
  voteStore.castVote(euro.id, "Barcelona, Spain", "voter_alex");
  voteStore.castVote(euro.id, "Paris, France", "voter_priya");
  voteStore.castVote(euro.id, "Barcelona, Spain", "voter_marcus");

  // ── Group 2: Japan Trip ─────────────────────────────────────────────────────
  const japan = groupStore.create({
    name: "Japan Cherry Blossom 🌸",
    description: "Sakura season, anime, ramen, and everything wonderful",
    creator: "Jamie Park",
    destinations: ["Tokyo, Japan", "Kyoto, Japan"],
    startDate: "2025-03-28",
    endDate: "2025-04-07",
    budget: { total: 8000, currency: "USD", perPerson: 2000 },
    status: "confirmed",
    members: [],
  });
  groupStore.addMember(japan.id, { name: "Jamie Park", email: "jamie@example.com", role: "organizer" });
  groupStore.addMember(japan.id, { name: "Yuki Tanaka", email: "yuki@example.com", role: "member" });
  groupStore.addMember(japan.id, { name: "Carlos Rivera", email: "carlos@example.com", role: "member" });

  // ── Group 3: Weekend Getaway ────────────────────────────────────────────────
  groupStore.create({
    name: "Coorg Weekend 🏞️",
    description: "Quick coffee-plantation escape for four",
    creator: "Meera Nair",
    destinations: ["Coorg, Karnataka"],
    startDate: "2025-02-08",
    endDate: "2025-02-10",
    budget: { total: 1200, currency: "USD", perPerson: 300 },
    status: "completed",
    members: [],
  });

  console.log("🌱 Seed data loaded successfully!");
  console.log(`   Groups: ${groupStore.findAll().length}`);
  console.log(`   Demo invite code: ${euro.inviteCode}`);
}

module.exports = { seed };
