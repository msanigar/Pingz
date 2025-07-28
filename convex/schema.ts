import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    text: v.string(),
    author: v.string(),
    userId: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    channel: v.optional(v.string()),
    reactions: v.optional(v.array(v.object({
      emoji: v.string(),
      userId: v.string(),
      username: v.string(),
    }))),
    fileUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileType: v.optional(v.string()),
  }).index("by_channel", ["channel"])
    .index("by_user", ["userId"])
    .searchIndex("search_text", {
      searchField: "text",
      filterFields: ["channel"]
    }),
  
  channels: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.string(),
  }).index("by_name", ["name"]),
  
  users: defineTable({
    clerkId: v.string(),
    username: v.string(),
    avatarUrl: v.optional(v.string()),
    lastSeen: v.number(),
    isOnline: v.boolean(),
  }).index("by_clerk_id", ["clerkId"])
    .index("by_online", ["isOnline"]),
}); 