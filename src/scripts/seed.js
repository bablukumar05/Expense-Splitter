import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import { User } from '../models/User.js';
import Group from '../models/Group.js';
import Expense from '../models/Expense.js';
import { generateInviteCode } from '../utils/inviteCode.js';
import { toPaise } from '../utils/money.js';
import { calculateSplits } from '../utils/splitCalculator.js';
import { logger } from '../utils/logger.js';

const demoUsers = [
  { name: 'Asha Demo', email: 'asha.demo@example.com', password: 'DemoPass123' },
  { name: 'Bala Demo', email: 'bala.demo@example.com', password: 'DemoPass123' },
  { name: 'Charu Demo', email: 'charu.demo@example.com', password: 'DemoPass123' }
];

async function getOrCreateUser(details) {
  let user = await User.findOne({ email: details.email });
  if (!user) user = await User.create(details);
  return user;
}

async function seed() {
  await connectDatabase();
  const users = await Promise.all(demoUsers.map(getOrCreateUser));
  let group = await Group.findOne({ name: 'Expense Splitter Demo', createdBy: users[0]._id });

  if (!group) {
    group = await Group.create({
      name: 'Expense Splitter Demo',
      type: 'friends',
      emoji: '🧾',
      currency: 'INR',
      createdBy: users[0]._id,
      members: users.map((user, index) => ({
        user: user._id,
        name: user.name,
        role: index === 0 ? 'admin' : 'member'
      })),
      invite: { code: generateInviteCode() }
    });
  }

  const hasExpenses = await Expense.exists({ group: group._id });
  if (!hasExpenses) {
    const activeMembers = group.activeMembers();
    const examples = [
      { description: 'Demo dinner', amount: 1800, category: 'food', payerIndex: 0 },
      { description: 'Demo taxi', amount: 600, category: 'transport', payerIndex: 1 },
      { description: 'Demo hotel', amount: 4500, category: 'stay', payerIndex: 2 }
    ];
    for (const example of examples) {
      const total = toPaise(example.amount);
      await Expense.create({
        group: group._id,
        description: example.description,
        amount: total,
        currency: group.currency,
        category: example.category,
        paidBy: [{ member: activeMembers[example.payerIndex]._id, amount: total }],
        splitType: 'EQUAL',
        splits: calculateSplits({
          splitType: 'EQUAL',
          total,
          splits: activeMembers.map((member) => ({ member: member._id }))
        }),
        createdBy: users[example.payerIndex]._id
      });
    }
  }

  logger.info('Demo data is ready', {
    groupId: String(group._id),
    demoEmails: demoUsers.map((user) => user.email)
  });
}

seed()
  .catch((error) => {
    logger.error('Could not seed demo data', { message: error.message, stack: error.stack });
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });