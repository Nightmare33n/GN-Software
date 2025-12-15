const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// MongoDB connection
const connectMongo = async () => {
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
};

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // Initialize Socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || `http://localhost:${port}`,
      credentials: true,
    },
  });

  // Store active users
  const activeUsers = new Map(); // userId -> socketId

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    // Join user to their personal room
    socket.on('user_connected', async (userId) => {
      if (!userId) return;

      try {
        await connectMongo();

        // Import User model dynamically
        const User = require('./models/User.js').default;

        // Store active user
        activeUsers.set(userId, socket.id);
        socket.userId = userId;
        socket.join(userId);

        // Update user online status
        await User.findByIdAndUpdate(userId, {
          onlineStatus: true,
          lastSeen: new Date(),
        });

        // Broadcast online status
        io.emit('user_status_change', {
          userId,
          online: true,
        });

        console.log(`✅ User ${userId} connected`);
      } catch (error) {
        console.error('Error on user_connected:', error);
      }
    });

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`👥 User joined conversation: ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`👋 User left conversation: ${conversationId}`);
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        await connectMongo();

        const { conversationId, content, messageType = 'text' } = data;

        if (!socket.userId || !conversationId || !content) {
          socket.emit('error', { message: 'Invalid message data' });
          return;
        }

        // Import models
        const Message = require('./models/Message.js').default;
        const Conversation = require('./models/Conversation.js').default;

        // Create message
        const message = await Message.create({
          conversationId,
          senderId: socket.userId,
          content,
          messageType,
        });

        // Populate sender info
        await message.populate('senderId', 'name image');

        // Update conversation
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        conversation.lastMessage = {
          content,
          senderId: socket.userId,
          timestamp: new Date(),
        };

        // Increment unread for other participant
        conversation.participants.forEach(participantId => {
          const id = participantId.toString();
          if (id !== socket.userId) {
            const current = conversation.unreadCount.get(id) || 0;
            conversation.unreadCount.set(id, current + 1);
          }
        });

        await conversation.save();

        // Emit to conversation room
        io.to(`conversation:${conversationId}`).emit('new_message', message);

        // Emit to participants for conversation list update
        conversation.participants.forEach(participantId => {
          io.to(participantId.toString()).emit('conversation_updated', {
            conversationId,
            lastMessage: conversation.lastMessage,
            unreadCount: conversation.unreadCount.get(participantId.toString()) || 0,
          });
        });

        console.log(`💬 Message sent in conversation ${conversationId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Typing indicator
    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping,
      });
    });

    // Mark messages as read
    socket.on('mark_read', async ({ conversationId }) => {
      try {
        await connectMongo();

        const Message = require('./models/Message.js').default;
        const Conversation = require('./models/Conversation.js').default;

        // Mark all unread messages as read
        await Message.markConversationAsRead(conversationId, socket.userId);

        // Reset unread count in conversation
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          conversation.resetUnread(socket.userId);

          // Notify sender that messages were read
          conversation.participants.forEach(participantId => {
            const id = participantId.toString();
            if (id !== socket.userId) {
              io.to(id).emit('messages_read', {
                conversationId,
                readBy: socket.userId,
              });
            }
          });
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Disconnect handling
    socket.on('disconnect', async () => {
      console.log('🔌 Client disconnected:', socket.id);

      if (socket.userId) {
        try {
          await connectMongo();

          const User = require('./models/User.js').default;

          // Remove from active users
          activeUsers.delete(socket.userId);

          // Update user's lastSeen
          await User.findByIdAndUpdate(socket.userId, {
            onlineStatus: false,
            lastSeen: new Date(),
          });

          // Broadcast offline status
          io.emit('user_status_change', {
            userId: socket.userId,
            online: false,
          });

          console.log(`❌ User ${socket.userId} disconnected`);
        } catch (error) {
          console.error('Error on disconnect:', error);
        }
      }
    });
  });

  // Make io accessible globally
  global.io = io;

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`\n✨ Ready on http://${hostname}:${port}`);
    console.log(`📡 Socket.io server running`);
  });
});
