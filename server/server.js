require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const webPush = require('web-push');
const Queue = require('./models/queue.model');
const queueRoutes = require('./routes/queue.routes');

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

webPush.setVapidDetails(
  `mailto:youremail@example.com`,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());
app.use('/api/queues', queueRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

io.on('connection', (socket) => {
  socket.on('join-queue-room', (queueId) => {
    socket.join(queueId);
  });

  socket.on('join-queue', async ({ queueId, subscription }, callback) => {
    try {
      const queue = await Queue.findById(queueId);
      if (!queue) return callback({ error: 'Queue not found' });
      
      const ticketNumber = queue.nextTicket;
      const newTicket = { ticketNumber, subscription, timeAdjustment: 0 };
      queue.waiting.push(newTicket);
      queue.nextTicket += 1;
      
      const updatedQueue = await queue.save();
      io.to(queueId).emit('queue-updated', updatedQueue);
      callback({ ticketNumber });
    } catch (error) {
      callback({ error: 'Server error' });
    }
  });

  const handleCall = async (queueId, ticketNumber) => {
    const queue = await Queue.findById(queueId);
    if (!queue) return;

    const ticketToCall = queue.waiting.find(t => t.ticketNumber === ticketNumber);

    queue.currentlyServing = ticketNumber;
    queue.waiting = queue.waiting.filter(t => t.ticketNumber !== ticketNumber);

    const updatedQueue = await queue.save();
    io.to(queueId).emit('queue-updated', updatedQueue);

    if (ticketToCall && ticketToCall.subscription) {
      const payload = JSON.stringify({
        title: 'It\'s your turn!',
        body: `Your number, #${String(ticketNumber).padStart(3, '0')}, is now being served.`,
        icon: '/logo192.png',
      });
      webPush.sendNotification(ticketToCall.subscription, payload)
        .catch(err => console.error("Error sending notification, subscription probably expired.", err.body));
    }
  };

  socket.on('call-next', async ({ queueId }) => {
    const queue = await Queue.findById(queueId);
    if (queue && queue.waiting.length > 0) {
      const nextTicket = queue.waiting[0].ticketNumber;
      handleCall(queueId, nextTicket);
    }
  });

  socket.on('call-specific', async ({ queueId, ticketNumber }) => {
    handleCall(queueId, ticketNumber);
  });

  socket.on('remove-from-queue', async ({ queueId, ticketNumber }) => {
    const queue = await Queue.findById(queueId);
    if (!queue) return;

    queue.waiting = queue.waiting.filter(t => t.ticketNumber !== ticketNumber);
    const updatedQueue = await queue.save();
    io.to(queueId).emit('queue-updated', updatedQueue);
  });

  socket.on('update-next-ticket', async ({ queueId, newStartNumber }) => {
    const queue = await Queue.findById(queueId);
    if (!queue) return;

    queue.nextTicket = newStartNumber;
    const updatedQueue = await queue.save();
    io.to(queueId).emit('queue-updated', updatedQueue);
  });
  
  socket.on('update-estimated-time', async ({ queueId, newTime }) => {
    const queue = await Queue.findByIdAndUpdate(
      queueId, 
      { estimatedTimePerTicket: newTime },
      { new: true }
    );
    if (queue) {
      io.to(queueId).emit('queue-updated', queue);
    }
  });

  socket.on('adjust-ticket-time', async ({ queueId, ticketNumber, adjustment }) => {
      const queue = await Queue.findById(queueId);
      if (!queue) return;

      const ticketIndex = queue.waiting.findIndex(t => t.ticketNumber === ticketNumber);
      if (ticketIndex > -1) {
          queue.waiting[ticketIndex].timeAdjustment += adjustment;
          const updatedQueue = await queue.save();
          io.to(queueId).emit('queue-updated', updatedQueue);
      }
  });

  socket.on('leave-queue-room', (queueId) => {
    socket.leave(queueId);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));