import asyncHandler from 'express-async-handler';
import Subscriber from '../models/Subscriber.js';
import sendEmail from '../utils/sendEmail.js';

export const subscribe = asyncHandler(async (req, res) => {
  const { email, source } = req.body;

  let subscriber = await Subscriber.findOne({ email: email.toLowerCase() });

  if (subscriber) {
    if (subscriber.isActive) {
      return res.status(400).json({ message: 'Already subscribed' });
    } else {
      subscriber.isActive = true;
      subscriber.source = source || subscriber.source;
      await subscriber.save();
      return res.json({ message: 'Successfully resubscribed' });
    }
  }

  subscriber = await Subscriber.create({ email, source });

  const html = `
    <div style="background-color: #F4EDE0; color: #1A1410; font-family: 'Times New Roman', serif; padding: 40px;">
      <h1 style="color: #B5432A; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Welcome to Octune Vintage</h1>
      <p style="font-family: Arial, sans-serif;">You're on the list. Next drop, you'll know first.</p>
      <p style="font-family: Arial, sans-serif; margin-top: 40px; font-style: italic;">— The Octune Vintage Crew</p>
    </div>
  `;
  sendEmail({ to: email, subject: 'Welcome to Octune Vintage', html }).catch(console.error);

  res.status(201).json({ message: 'Successfully subscribed' });
});

export const unsubscribe = asyncHandler(async (req, res) => {
  const subscriber = await Subscriber.findOne({ unsubscribeToken: req.params.token });
  
  if (subscriber) {
    subscriber.isActive = false;
    await subscriber.save();
  }

  res.send(`
    <html>
      <body style="background-color: #F4EDE0; color: #1A1410; font-family: 'Times New Roman', serif; text-align: center; padding-top: 20%;">
        <h1>Unsubscribed.</h1>
        <p>You will no longer receive drop alerts.</p>
      </body>
    </html>
  `);
});

export const listSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await Subscriber.find().sort({ createdAt: -1 });
  res.json(subscribers);
});

export const exportSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await Subscriber.find({ isActive: true });
  
  let csv = 'Email,Source,SubscribedAt\n';
  subscribers.forEach(sub => {
    csv += `${sub.email},${sub.source},${sub.createdAt}\n`;
  });

  res.header('Content-Type', 'text/csv');
  res.attachment('subscribers.csv');
  res.send(csv);
});

export const deleteSubscriber = asyncHandler(async (req, res) => {
  await Subscriber.findByIdAndDelete(req.params.id);
  res.json({ message: 'Subscriber removed' });
});
