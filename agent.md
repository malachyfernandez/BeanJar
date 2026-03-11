# BeanJar Development Guide

This guide covers the two data systems in BeanJar: **useUserVariable** (single values) and **useUserList** (multiple items).

---

## 🏗️ Architecture Overview

Both systems are built on Convex with optimistic UI updates, privacy controls, and real-time sync.

### Key Concepts
- **User-scoped**: All data belongs to authenticated users
- **Optimistic UI**: Updates appear instantly, rollback on failure
- **Privacy-first**: Everything is private until explicitly shared
- **Real-time**: Changes sync across all connected clients

---

## 🔧 useUserVariable System (Single Values)

Perfect for: User settings, profiles, preferences, single records

### Core Hooks

#### `useUserVariable<T>(options)`
Main hook for user-scoped variables.

```typescript
const [profile, setProfile] = useUserVariable<ProfileType>({
  key: "profile",
  defaultValue: { name: "", bio: "" },
  privacy: "PUBLIC",
  searchKeys: ["name", "bio"],
  filterKey: "name",
  sortKey: "name"
});
```

**Features:**
- Uniqueness: `userToken + key`
- Auto-creates if `defaultValue` provided
- Optimistic updates with timeout handling
- Privacy: `"PUBLIC"`, `"PRIVATE"`, `string[]` (whitelist)

#### `useUserVariableGet<T>(options)`
Read multiple users' variables.

```typescript
const profiles = useUserVariableGet<ProfileType>({
  key: "profile",
  searchFor: "john",
  filterFor: "active",
  userIds: ["user1", "user2"],
  returnTop: 20,
  startAfter: "lastRecordId" // pagination
});
```

**Features:**
- Multi-user access with privacy enforcement
- Search, filter, and pagination support
- Returns array of accessible records

#### `useUserVariablePrivacy()`
Update privacy for variables.

```typescript
const setPrivacy = useUserVariablePrivacy();

// Make profile public
setPrivacy({ 
  key: "profile", 
  privacy: "PUBLIC" 
});

// Share with specific users
setPrivacy({ 
  key: "profile", 
  privacy: ["user1", "user2"] 
});
```

---

## 📋 useUserList System (Multiple Items)

Perfect for: Posts, inventory, bookmarks, comments, any collection

### Core Hooks

#### `useUserList<T>(options)`
Main hook for individual list items.

```typescript
const [post, setPost] = useUserList<PostType>({
  key: "posts",
  itemId: "post_123",
  defaultValue: { title: "", body: "", rank: 0 },
  privacy: "PUBLIC",
  searchKeys: ["title", "body", "PROPERTY_ITEMID"],
  filterKey: "title", 
  sortKey: "rank"
});
```

**Key Features:**
- Uniqueness: `userToken + key + itemId`
- **PROPERTY_ITEMID**: Special property for item ID in search/filter/sort
- List-level privacy (all items share same privacy)
- Auto-creates if `defaultValue` provided

#### `useUserListGet<T>(options)`
Read multiple list items.

```typescript
// Get all posts
const posts = useUserListGet<PostType>({
  key: "posts",
  returnTop: 20
});

// Get specific item
const post = useUserListGet<PostType>({
  key: "posts",
  itemId: "post_123"
});

// Search and paginate
const searchResults = useUserListGet<PostType>({
  key: "posts",
  searchFor: "react",
  filterFor: "published",
  returnTop: 10,
  startAfter: "lastRecordId"
});
```

**Features:**
- Exact lookup with `itemId`
- Multi-item search with pagination
- Supports `PROPERTY_ITEMID` in search/filter/sort

#### `useUserListSet<T>()`
Upsert items without hook instantiation.

```typescript
const setPost = useUserListSet<PostType>();

// Create new post
setPost({
  key: "posts",
  itemId: "post_456",
  value: { title: "New Post", body: "Content" },
  privacy: "PUBLIC",
  searchKeys: ["title", "body"]
});
```

#### `useUserListPrivacy()`
Update privacy for entire lists.

```typescript
const setListPrivacy = useUserListPrivacy();

// Make all posts public
setListPrivacy({ 
  key: "posts", 
  privacy: "PUBLIC" 
});
```

#### `useUserListRemove()`
Delete individual list items.

```typescript
const removePost = useUserListRemove();

removePost({ 
  key: "posts", 
  itemId: "post_123" 
});
```

---

## 🔗 How Systems Work Together

### Profile + Posts Example
```typescript
// User's single profile
const [profile, setProfile] = useUserVariable({
  key: "profile",
  defaultValue: { name: "", avatar: "" },
  privacy: "PUBLIC"
});

// User's multiple posts
const [post, setPost] = useUserList({
  key: "posts", 
  itemId: "post_123",
  defaultValue: { title: "", body: "" },
  privacy: "PUBLIC"
});

// Get all posts from all users
const allPosts = useUserListGet({
  key: "posts",
  returnTop: 50
});

// Update profile privacy
const setPrivacy = useUserVariablePrivacy();
setPrivacy({ key: "profile", privacy: "PUBLIC" });
```

### Settings + Data Example
```typescript
// User preferences (single)
const [settings, setSettings] = useUserVariable({
  key: "settings",
  defaultValue: { theme: "dark", notifications: true },
  privacy: "PRIVATE"
});

// User's bookmarks (list)
const bookmarks = useUserListGet({
  key: "bookmarks",
  returnTop: 100
});

// Add new bookmark
const addBookmark = useUserListSet();
addBookmark({
  key: "bookmarks",
  itemId: `bookmark_${Date.now()}`,
  value: { url: "https://example.com", title: "Example" }
});
```

---

## 🎯 Choosing the Right System

| Use Case | System | Why |
|-----------|---------|------|
| User profile/settings | `useUserVariable` | Single value per user |
| Blog posts | `useUserList` | Multiple posts, need individual items |
| Shopping list | `useUserList` | Collection of items |
| App preferences | `useUserVariable` | Single settings object |
| Comments | `useUserList` | Multiple comments per post |
| User status | `useUserVariable` | Single status value |
| Inventory | `useUserList` | Multiple items with properties |

---

## 🚀 Quick Start Patterns

### 1. Basic Profile
```typescript
const [profile, setProfile] = useUserVariable({
  key: "profile",
  defaultValue: { name: "User", bio: "" }
});
```

### 2. Simple List
```typescript
const [item, setItem] = useUserList({
  key: "todos",
  itemId: "todo_1", 
  defaultValue: { text: "Learn hooks", done: false }
});
```

### 3. Multi-Item Query
```typescript
const items = useUserListGet({
  key: "todos",
  returnTop: 10
});
```

### 4. Privacy Control
```typescript
const setPrivacy = useUserVariablePrivacy();
setPrivacy({ key: "profile", privacy: "PUBLIC" });
```

---

## 📱 React Native Integration

All hooks work seamlessly with React Native components:

```typescript
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useUserVariable } from '../hooks/useUserVariable';
import { useUserList } from '../hooks/useUserList';

export default function MyComponent() {
  const [profile, setProfile] = useUserVariable({
    key: "profile",
    defaultValue: { name: "" }
  });

  const [post, setPost] = useUserList({
    key: "posts",
    itemId: "main",
    defaultValue: { title: "", body: "" }
  });

  return (
    <View>
      <TouchableOpacity onPress={() => setProfile({ name: "New Name" })}>
        <Text>Update Profile</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setPost({ title: "New Title", body: "New Content" })}>
        <Text>Update Post</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## 🔒 Privacy Model

### Privacy Levels
- **`"PRIVATE"`**: Only owner can access
- **`"PUBLIC"`**: Anyone can access  
- **`string[]`**: Whitelist - only specified users can access

### Privacy Inheritance
- **useUserVariable**: Privacy per variable
- **useUserList**: Privacy per list (all items inherit list privacy)

### Access Control
All queries automatically enforce:
1. Owner always has access
2. Public items accessible to everyone
3. Whitelist items accessible to allowed users only

---

## 🎯 TL;DR

**User Variables provide "useState for the Cloud."** 
You focus on UI and product logic; the framework handles persistence, real-time sync, full-text search, permissions, and database indexing.

**Two systems solve different problems:**
- **useUserVariable**: Single values (profile, settings, status)
- **useUserList**: Multiple items (posts, inventory, bookmarks)

**Both work together seamlessly** - choose based on your data structure needs.

---

This is everything you need to build with BeanJar's data systems. Start with the basic patterns and expand as needed!
