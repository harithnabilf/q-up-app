require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const Queue = require('./models/queue.model');
const queueRoutes = require('./routes/queue.routes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use('/api/queues', queueRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

io.on('connection', (socket) => {
  socket.on('join-queue-room', (queueId) => {
    socket.join(queueId);
  });

  socket.on('join-queue', async ({ queueId }, callback) => {
    try {
      const queue = await Queue.findById(queueId);
      if (!queue) return callback({ error: 'Queue not found' });
      
      const ticketNumber = queue.nextTicket;
      queue.waiting.push(ticketNumber);
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

    queue.currentlyServing = ticketNumber;
    queue.waiting = queue.waiting.filter(num => num !== ticketNumber);

    const updatedQueue = await queue.save();
    io.to(queueId).emit('queue-updated', updatedQueue);
  };

  socket.on('call-next', async ({ queueId }) => {
    const queue = await Queue.findById(queueId);
    if (queue && queue.waiting.length > 0) {
      const nextTicket = queue.waiting[0];
      handleCall(queueId, nextTicket);
    }
  });

  socket.on('call-specific', async ({ queueId, ticketNumber }) => {
    handleCall(queueId, ticketNumber);
  });

  socket.on('remove-from-queue', async ({ queueId, ticketNumber }) => {
    const queue = await Queue.findById(queueId);
    if (!queue) return;

    queue.waiting = queue.waiting.filter(num => num !== ticketNumber);
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

  socket.on('leave-queue-room', (queueId) => {
    socket.leave(queueId);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));