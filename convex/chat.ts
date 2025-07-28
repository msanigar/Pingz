import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get messages for a specific channel
export const getMessages = query({
  args: { channel: v.optional(v.string()) },
  handler: async (ctx, { channel = "general" }) => {
    const messages = await ctx.db
      .query("messages")
      .filter((q) => 
        q.or(
          q.eq(q.field("channel"), channel),
          q.and(q.eq(q.field("channel"), undefined), q.eq(channel, "general"))
        )
      )
      .order("desc")
      .take(100);
    
    return messages.reverse();
  },
});

// Send a new message
export const sendMessage = mutation({
  args: {
    text: v.string(),
    author: v.string(),
    channel: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    fileId: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileType: v.optional(v.string()),
  },
  handler: async (ctx, { text, author, channel = "general", avatarUrl, fileId, fileName, fileType }) => {
    // For file messages, allow empty text
    if (!fileId && text.trim().length === 0) {
      throw new Error("Message cannot be empty.");
    }
    
    // Validate message length for text messages
    if (text && text.length > 2000) {
      throw new Error("Message too long. Maximum 2000 characters.");
    }

    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    // Get file URL if file is attached
    let fileUrl: string | undefined = undefined;
    if (fileId) {
      const url = await ctx.storage.getUrl(fileId);
      fileUrl = url || undefined;
    }

    await ctx.db.insert("messages", {
      text: text.trim(),
      author,
      userId,
      avatarUrl,
      channel,
      reactions: [],
      fileUrl,
      fileName,
      fileType,
    });
  },
});

// Toggle message reaction
export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
    username: v.string(),
  },
  handler: async (ctx, { messageId, emoji, username }) => {
    const identity = await ctx.auth.getUserIdentity();
    // Use a consistent user identifier based on username for now
    const userId = identity?.subject || `temp_${username}`;

    const message = await ctx.db.get(messageId);
    if (!message) throw new Error("Message not found");

    const reactions = message.reactions || [];
    const existingReactionIndex = reactions.findIndex(
      r => r.userId === userId && r.emoji === emoji
    );

    if (existingReactionIndex >= 0) {
      // Remove reaction (toggle off)
      reactions.splice(existingReactionIndex, 1);
    } else {
      // Add reaction (toggle on) - but first remove any other reactions from this user for this emoji
      const updatedReactions = reactions.filter(r => !(r.userId === userId && r.emoji === emoji));
      updatedReactions.push({ emoji, userId, username });
      await ctx.db.patch(messageId, { reactions: updatedReactions });
      return;
    }

    await ctx.db.patch(messageId, { reactions });
  },
});

// Search messages
export const searchMessages = query({
  args: { 
    query: v.string(),
    channel: v.optional(v.string())
  },
  handler: async (ctx, { query, channel = "general" }) => {
    if (query.length < 2) return [];
    
    const results = await ctx.db
      .query("messages")
      .withSearchIndex("search_text", (q) => 
        q.search("text", query).eq("channel", channel)
      )
      .take(50);
    
    return results;
  },
});

// Get all channels
export const getChannels = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("channels").collect();
  },
});

// Create a new channel
export const createChannel = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { name, description }) => {
    const identity = await ctx.auth.getUserIdentity();
    const createdBy = identity?.subject || "anonymous";

    // Check if channel already exists
    const existing = await ctx.db
      .query("channels")
      .withIndex("by_name", (q) => q.eq("name", name))
      .first();
    
    if (existing) throw new Error("Channel already exists");

    return await ctx.db.insert("channels", {
      name,
      description,
      createdBy,
    });
  },
});

// Update user presence
export const updateUserPresence = mutation({
  args: {
    username: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, { username, avatarUrl }) => {
    const identity = await ctx.auth.getUserIdentity();
    // Use consistent user ID based on username (not Date.now()!)
    const clerkId = identity?.subject || `temp_${username}`;

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    const userData = {
      clerkId,
      username,
      avatarUrl,
      lastSeen: Date.now(),
      isOnline: true,
    };

    if (existing) {
      await ctx.db.patch(existing._id, userData);
    } else {
      await ctx.db.insert("users", userData);
    }
  },
});

// Get online users count
export const getOnlineUsersCount = query({
  args: {},
  handler: async (ctx) => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const onlineUsers = await ctx.db
      .query("users")
      .withIndex("by_online", (q) => q.eq("isOnline", true))
      .filter((q) => q.gte(q.field("lastSeen"), fiveMinutesAgo))
      .collect();
    
    return onlineUsers.length;
  },
}); 