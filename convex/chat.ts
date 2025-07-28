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

// Helper function to check if user is admin (hardcoded for simplicity)
const isAdmin = (identity: any): boolean => {
  try {
    console.log("isAdmin: Starting with identity:", typeof identity);
    
    if (!identity || typeof identity !== 'object') {
      console.log("isAdmin: Invalid identity object");
      return false;
    }
    
    const adminUserId = 'user_30UslN6tLnNxsknxxrs0qBzyWpJ';
    const adminEmail = 'myles.sanigar@gmail.com';
    
    console.log("isAdmin: Checking subject:", identity.subject);
    
    // Check by user ID (subject)
    if (identity.subject === adminUserId) {
      console.log("isAdmin: Admin found by subject ID");
      return true;
    }
    
    // Check by email (try different possible email fields with safe access)
    const userEmail = identity.emailAddress || 
                     identity.email || 
                     (identity.primaryEmailAddress && identity.primaryEmailAddress.emailAddress);
    
    console.log("isAdmin: Checking email:", userEmail);
    
    if (userEmail === adminEmail) {
      console.log("isAdmin: Admin found by email");
      return true;
    }
    
    console.log("isAdmin: Not admin");
    return false;
  } catch (error) {
    console.error("Error in isAdmin function:", error);
    return false;
  }
};

// Remove the complex setup functions since we're using simple hardcoded admin
// ensureUserInOrganization and setUserRole are no longer needed

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

    // Force lowercase and clean the name
    const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    
    if (!cleanName) {
      throw new Error("Channel name must contain at least one letter or number");
    }

    // Check if channel already exists
    const existing = await ctx.db
      .query("channels")
      .withIndex("by_name", (q) => q.eq("name", cleanName))
      .first();
    
    if (existing) throw new Error("Channel already exists");

    return await ctx.db.insert("channels", {
      name: cleanName,
      description,
      createdBy,
    });
  },
});

// Delete a channel (admin only)
export const deleteChannel = mutation({
  args: {
    channelId: v.id("channels"),
  },
  handler: async (ctx, { channelId }) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Must be authenticated to delete channels");
    }

    // Check if user is admin using hardcoded admin check
    if (!isAdmin(identity)) {
      throw new Error("Only the admin can delete channels");
    }

    // Don't allow deletion of "general" channel
    const channel = await ctx.db.get(channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }
    
    if (channel.name === "general") {
      throw new Error("Cannot delete the general channel");
    }

    // Delete the channel
    await ctx.db.delete(channelId);
    
    // Move messages from deleted channel to general
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channel", channel.name))
      .collect();
    
    for (const message of messages) {
      await ctx.db.patch(message._id, { channel: "general" });
    }

    return { success: true, channelName: channel.name };
  },
});

// Simple test query to check auth
export const testAuth = query({
  args: {},
  handler: async (ctx) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      return {
        hasAuth: !!identity,
        subject: identity?.subject || null,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        hasAuth: false,
        error: String(error),
        timestamp: Date.now()
      };
    }
  },
});

// Check if current user is admin using simple hardcoded check
export const isCurrentUserAdmin = query({
  args: {},
  handler: async (ctx) => {
    try {
      console.log("isCurrentUserAdmin: Starting query");
      const identity = await ctx.auth.getUserIdentity();
      console.log("isCurrentUserAdmin: Got identity:", JSON.stringify(identity, null, 2));
      
      if (!identity) {
        console.log("isCurrentUserAdmin: No identity found");
        return false; // User not authenticated
      }
      
      const result = isAdmin(identity);
      console.log("isCurrentUserAdmin: Admin check result:", result);
      return result;
    } catch (error) {
      console.error("Error in isCurrentUserAdmin query:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      return false; // Default to non-admin if there's an error
    }
  },
});

// Get current user's admin status
export const getUserOrgInfo = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    const userIsAdmin = isAdmin(identity);
    
    return {
      isInOrg: true,
      orgId: 'pingz',
      orgRole: userIsAdmin ? 'admin' : 'member',
      isAdmin: userIsAdmin,
      usingSimpleAdmin: true
    };
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