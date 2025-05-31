const { createServer } = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Store active rooms and their states
const activeRooms = new Map();

// Room state structure
class RoomState {
  constructor(roomCode) {
    this.roomCode = roomCode;
    this.participants = new Map(); // socketId -> userInfo
    this.codeState = {
      code: '',
      language: 'javascript',
      cursorPosition: null
    };
    this.currentQuestion = null;
    this.chatMessages = [];
    this.timerState = {
      duration: 1800, // 30 minutes
      remaining: 1800,
      isRunning: false,
      startedAt: null
    };
    this.timerInterval = null;
  }

  addParticipant(socketId, userInfo) {
    this.participants.set(socketId, userInfo);
    console.log(`User ${userInfo.name} joined room ${this.roomCode}`);
  }

  removeParticipant(socketId) {
    const userInfo = this.participants.get(socketId);
    this.participants.delete(socketId);
    if (userInfo) {
      console.log(`User ${userInfo.name} left room ${this.roomCode}`);
    }
    
    // Clean up room if empty
    if (this.participants.size === 0) {
      this.cleanup();
      activeRooms.delete(this.roomCode);
      console.log(`Room ${this.roomCode} cleaned up - no participants`);
    }
  }

  startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerState.isRunning = true;
    this.timerState.startedAt = new Date();

    this.timerInterval = setInterval(() => {
      if (this.timerState.remaining > 0) {
        this.timerState.remaining--;
        
        // Broadcast timer update
        io.to(this.roomCode).emit('timer-update', this.timerState);
        
        // End timer when it reaches 0
        if (this.timerState.remaining === 0) {
          this.stopTimer();
          io.to(this.roomCode).emit('timer-finished');
        }
      }
    }, 1000);
  }

  stopTimer() {
    this.timerState.isRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  resetTimer() {
    this.stopTimer();
    this.timerState.remaining = this.timerState.duration;
    this.timerState.startedAt = null;
  }

  cleanup() {
    this.stopTimer();
  }
}

// Socket connection handler
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Join room event
  socket.on('join-room', async ({ roomCode, userId }) => {
    try {
      // Validate room exists in database
      const room = await prisma.room.findUnique({
        where: { roomCode },
        include: {
          participants: {
            include: {
              user: true
            }
          }
        }
      });

      if (!room || !room.isActive) {
        socket.emit('error', { message: 'Room not found or inactive' });
        return;
      }

      // Check if room is full
      if (room.participants.length >= room.maxUsers) {
        socket.emit('error', { message: 'Room is full' });
        return;
      }

      // Get user info
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        socket.emit('error', { message: 'User not found' });
        return;
      }

      // Join socket room
      socket.join(roomCode);

      // Get or create room state
      let roomState = activeRooms.get(roomCode);
      if (!roomState) {
        roomState = new RoomState(roomCode);
        activeRooms.set(roomCode, roomState);
      }

      // Add participant to room state
      const userInfo = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: room.hostId === userId ? 'interviewer' : 'interviewee'
      };
      
      roomState.addParticipant(socket.id, userInfo);

      // Send current room state to joining user
      socket.emit('room-state', {
        room: room,
        participants: Array.from(roomState.participants.values()),
        codeState: roomState.codeState,
        currentQuestion: roomState.currentQuestion,
        chatMessages: roomState.chatMessages,
        timerState: roomState.timerState
      });

      // Notify other participants
      socket.to(roomCode).emit('user-joined', {
        user: userInfo,
        participants: Array.from(roomState.participants.values())
      });

      console.log(`User ${user.name} joined room ${roomCode}`);

    } catch (error) {
      console.error('Join room error:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Leave room event
  socket.on('leave-room', ({ roomCode }) => {
    const roomState = activeRooms.get(roomCode);
    if (roomState) {
      const userInfo = roomState.participants.get(socket.id);
      roomState.removeParticipant(socket.id);
      
      if (userInfo) {
        socket.to(roomCode).emit('user-left', {
          userId: userInfo.id,
          participants: Array.from(roomState.participants.values())
        });
      }
    }
    
    socket.leave(roomCode);
  });

  // Code change event
  socket.on('code-change', ({ roomCode, codeState }) => {
    const roomState = activeRooms.get(roomCode);
    if (roomState) {
      roomState.codeState = { ...roomState.codeState, ...codeState };
      socket.to(roomCode).emit('code-change', roomState.codeState);
    }
  });

  // Cursor change event
  socket.on('cursor-change', ({ roomCode, userId, position }) => {
    socket.to(roomCode).emit('cursor-change', { userId, position });
  });

  // Question selection event
  socket.on('question-selected', ({ roomCode, question }) => {
    const roomState = activeRooms.get(roomCode);
    if (roomState) {
      roomState.currentQuestion = question;
      // Set starter code based on current language
      const starterCode = question.starterCode[roomState.codeState.language] || '';
      roomState.codeState.code = starterCode;
      
      io.to(roomCode).emit('question-selected', {
        question,
        codeState: roomState.codeState
      });
    }
  });

  // Chat message event
  socket.on('chat-message', ({ roomCode, message }) => {
    const roomState = activeRooms.get(roomCode);
    if (roomState) {
      const messageWithTimestamp = {
        ...message,
        timestamp: new Date()
      };
      
      roomState.chatMessages.push(messageWithTimestamp);
      io.to(roomCode).emit('chat-message', messageWithTimestamp);
    }
  });

  // Timer events
  socket.on('timer-start', ({ roomCode, duration }) => {
    const roomState = activeRooms.get(roomCode);
    if (roomState) {
      if (duration) {
        roomState.timerState.duration = duration;
        roomState.timerState.remaining = duration;
      }
      roomState.startTimer();
      io.to(roomCode).emit('timer-start', roomState.timerState);
    }
  });

  socket.on('timer-pause', ({ roomCode }) => {
    const roomState = activeRooms.get(roomCode);
    if (roomState) {
      roomState.stopTimer();
      io.to(roomCode).emit('timer-pause', roomState.timerState);
    }
  });

  socket.on('timer-resume', ({ roomCode }) => {
    const roomState = activeRooms.get(roomCode);
    if (roomState) {
      roomState.startTimer();
      io.to(roomCode).emit('timer-resume', roomState.timerState);
    }
  });

  socket.on('timer-reset', ({ roomCode }) => {
    const roomState = activeRooms.get(roomCode);
    if (roomState) {
      roomState.resetTimer();
      io.to(roomCode).emit('timer-reset', roomState.timerState);
    }
  });

  // Session end event
  socket.on('session-end', async ({ roomCode, feedback }) => {
    try {
      const roomState = activeRooms.get(roomCode);
      if (roomState) {
        // Save session data to database
        const room = await prisma.room.findUnique({
          where: { roomCode }
        });

        if (room) {
          // Create interview session record
          await prisma.interviewSession.create({
            data: {
              roomId: room.id,
              userId: room.hostId,
              code: roomState.codeState.code,
              language: roomState.codeState.language,
              question: roomState.currentQuestion,
              feedback: feedback,
              duration: roomState.timerState.duration - roomState.timerState.remaining,
              completedAt: new Date()
            }
          });

          // Mark room as inactive
          await prisma.room.update({
            where: { id: room.id },
            data: { isActive: false }
          });
        }

        // Notify all participants
        io.to(roomCode).emit('session-ended', {
          feedback,
          codeSnapshot: roomState.codeState.code,
          duration: roomState.timerState.duration - roomState.timerState.remaining
        });

        // Cleanup room
        roomState.cleanup();
        activeRooms.delete(roomCode);
      }
    } catch (error) {
      console.error('Session end error:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    
    // Remove from all rooms
    for (const [roomCode, roomState] of activeRooms.entries()) {
      if (roomState.participants.has(socket.id)) {
        const userInfo = roomState.participants.get(socket.id);
        roomState.removeParticipant(socket.id);
        
        if (userInfo) {
          socket.to(roomCode).emit('user-left', {
            userId: userInfo.id,
            participants: Array.from(roomState.participants.values())
          });
        }
      }
    }
  });
});

// Clean up expired rooms every hour
setInterval(async () => {
  try {
    const expiredRooms = await prisma.room.findMany({
      where: {
        expiresAt: {
          lt: new Date()
        },
        isActive: true
      }
    });

    for (const room of expiredRooms) {
      await prisma.room.update({
        where: { id: room.id },
        data: { isActive: false }
      });

      // Clean up active room state
      const roomState = activeRooms.get(room.roomCode);
      if (roomState) {
        io.to(room.roomCode).emit('room-expired');
        roomState.cleanup();
        activeRooms.delete(room.roomCode);
      }
    }

    console.log(`Cleaned up ${expiredRooms.length} expired rooms`);
  } catch (error) {
    console.error('Room cleanup error:', error);
  }
}, 60 * 60 * 1000); // Run every hour

const PORT = process.env.SOCKET_PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.io server running on port ${PORT}`);
  console.log(`🔗 CORS enabled for: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  
  // Clean up all rooms
  for (const [roomCode, roomState] of activeRooms.entries()) {
    roomState.cleanup();
  }
  
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});