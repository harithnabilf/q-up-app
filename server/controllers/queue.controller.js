const Queue = require('../models/queue.model');
const { generateId } = require('../utils/generateId');

exports.createQueue = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Queue name is required' });
    }
    const newQueue = new Queue({ _id: generateId(), name });
    await newQueue.save();
    res.status(201).json(newQueue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getQueue = async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id);
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }
    res.status(200).json(queue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getVapidPublicKey = (req, res) => {
    if (!process.env.VAPID_PUBLIC_KEY) {
        return res.status(500).send("VAPID public key not configured.");
    }
    res.status(200).send(process.env.VAPID_PUBLIC_KEY);
};