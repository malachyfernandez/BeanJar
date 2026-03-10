# The “Client-Side Backend” Idea: User Variables

## Core Vision

Imagine you could write a React component **as if it were local state**, but under the hood it’s a **real-time, cloud-persisted, searchable, and socially-aware data store**—without writing a single line of backend code.

You don’t create tables, API endpoints, or manage complex database indexes manually. You just declare your intent in the frontend:

```tsx
const [profile, setProfile] = useUserVariable({
  key: "profile",
  defaultValue: { name: "Alice", bio: "Loves beans", rank: 1 },
  privacy: "PUBLIC",
  searchKeys: ["name", "bio"],
  filterKey: "name",
  sortKey: "rank",
});
```

The system automatically:
- **Persists** data to the cloud instantly.
- **Syncs** state across all of the user's devices in real-time.
- **Indexes** for search, filtering, and sorting based on your config.
- **Enforces** permissions (Public, Private, or Whitelist).
- **Derives** query values on the server to ensure data integrity and trust.

---

## Why This Is Powerful

### 1. Zero Backend Boilerplate
Normally, a "profile" feature requires a database schema, `GET/PATCH` endpoints, search indexes, and permission logic. With User Variables, the backend infrastructure is generated dynamically based on your frontend declaration.

### 2. Real-Time, Persistent State
`useState` is local and resets on refresh. `useUserVariable` survives page reloads and syncs across devices, providing a "confirmed" server value alongside the "optimistic" UI value for a lag-free experience.

### 3. Built-In Social Logic
Privacy is a first-class citizen. You don't manually check "can User A see User B's record?" You just define the rule:
- `privacy: "PUBLIC"`: Everyone can read.
- `privacy: "PRIVATE"`: Only the owner.
- `privacy: ["userId1", "userId2"]`: Explicit whitelist access.

### 4. Advanced Querying Without SQL
To build a social feed or directory, you use a simple hook:
```tsx
const results = useUserVariableGet({
  key: "profile",
  searchFor: "Alice", // Full-text search
  filterFor: "Bob",   // Exact match
  userIds: friends,   // Restrict to a list of users
});
```
The system handles the complex joining of public data and whitelist permissions automatically.

---

## The “Magic” Under the Hood

### 1. Server-Derived Query Values (The Trust Layer)
To prevent "index poisoning" (where a client lies about what their data contains to show up in wrong searches), the backend is the sole source of truth.
- You provide the **Keys** (e.g., `filterKey: "color"`).
- The server computes the **Values** (e.g., `filterValue: "Green"`).
This ensures that search results, filters, and sorts are always honest and consistent with the actual data.

### 2. Sort-on-Write Architecture
Unlike typical systems that sort data at "read time" (which is slow), this system uses a **Sort-on-Write** model. You define a `sortKey` (like "rank" or "lastModified"), and the system pre-calculates a `sortValue`. This makes global feeds and sorted lists lightning-fast.

### 3. Property References (`PROPERTY_*`)
You aren't limited to sorting/filtering by fields inside your data. You can reference record metadata:
- `sortKey: "PROPERTY_LAST_MODIFIED"`: Sort by most recently updated.
- `sortKey: "PROPERTY_CREATED_AT"`: Sort by oldest/newest records.

### 4. Scalable Whitelisting
Whitelists are handled via a high-performance `permissions` join table. Finding "every variable shared with me" is a direct index lookup, allowing the system to scale to millions of users without performance degradation.

---

## Developer Experience

### 1. The Full Record Return
The hook doesn't just return the value; it returns the full persisted record.
```tsx
const [user] = useUserVariable({ key: "user" });

user.value;          // Your data
user.id;             // The unique database ID
user.lastModified;   // Timestamp
user.privacy;        // Current access level
user.state;          // { isSyncing, lastOpStatus }
```

### 2. Replace Semantics
To keep logic simple and predictable, setters use **Replace Semantics**. When you `setProfile({ name: "Alice" })`, the entire value is replaced. No partial merges, no confusing "ghost" properties.

### 3. Configuration Persistence
By default, configuration like `privacy` or `searchKeys` acts as a "default-on-create." If you change a variable's privacy to a specific whitelist using the `useUserVariablePrivacy` hook, the system **remembers** that. Future value updates won't accidentally overwrite your privacy settings back to the initial defaults.

### 4. Optimistic UI & Timeouts
The system is built for the "intermittent web." 
- **Optimistic Updates**: The UI updates before the server responds.
- **Rollback Logic**: If a write fails or times out (default 5s), the hook can automatically roll back to the last "confirmed" value, ensuring the user never thinks data is saved when it isn't.

---

## What This Enables

- **Instant Prototyping**: Add persistent, searchable state in seconds.
- **Social Apps**: Build profiles, inventories, and shared lists without a backend dev.
- **Real-Time Dashboards**: Sync settings and status across multiple screens instantly.
- **Privacy-First Tools**: Everything is private until you explicitly make it public or share it.

---

## TL;DR

User Variables provide **"useState for the Cloud."** 
You focus on the UI and product logic; the framework handles the persistence, real-time sync, full-text search, permissions, and database indexing.