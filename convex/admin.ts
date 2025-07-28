import { mutation } from "./_generated/server";

// WARNING: This will delete ALL data - only use for development/testing!
export const clearAllData = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("⚠️  Clearing all data...");
    
    // Delete all messages
    const messages = await ctx.db.query("messages").collect();
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    console.log(`Deleted ${messages.length} messages`);
    
    // Delete all channels
    const channels = await ctx.db.query("channels").collect();
    for (const channel of channels) {
      await ctx.db.delete(channel._id);
    }
    console.log(`Deleted ${channels.length} channels`);
    
    // Delete all users
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.delete(user._id);
    }
    console.log(`Deleted ${users.length} users`);
    
    console.log("✅ All data cleared!");
    return { success: true, message: "All data cleared successfully" };
  },
});

// Clear only messages (keep channels and users)
export const clearMessages = mutation({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").collect();
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    console.log(`Deleted ${messages.length} messages`);
    return { success: true, message: `Deleted ${messages.length} messages` };
  },
});

// Clear only channels
export const clearChannels = mutation({
  args: {},
  handler: async (ctx) => {
    const channels = await ctx.db.query("channels").collect();
    for (const channel of channels) {
      await ctx.db.delete(channel._id);
    }
    console.log(`Deleted ${channels.length} channels`);
    return { success: true, message: `Deleted ${channels.length} channels` };
  },
}); 