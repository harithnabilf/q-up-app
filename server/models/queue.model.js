const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  ticketNumber: { type: Number, required: true },
  subscription: { type: Object, default: null }
}, { _id: false });

const QueueSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  currentlyServing: { type: Number, default: null },
  nextTicket: { type: Number, default: 1 },
  waiting: { type: [TicketSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Queue', QueueSchema);