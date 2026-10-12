import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import Group from '../models/Group.js';
import Expense from '../models/Expense.js';
import Settlement from '../models/Settlement.js';
import RecurringExpense from '../models/RecurringExpense.js';
import { generateInviteCode } from '../utils/inviteCode.js';
import { toPaise } from '../utils/money.js';
import { calculateSplits } from '../utils/splitCalculator.js';
import { logger } from '../utils/logger.js';
import { notificationQueue } from '../services/notificationQueue.js';
import { addExpenseComment } from '../services/comment.service.js';

const DEMO_PASSWORD = 'DemoPass123';

const demoUsersData = [
  { name: 'Asha Demo', email: 'asha.demo@example.com', password: DEMO_PASSWORD },
  { name: 'Bala Demo', email: 'bala.demo@example.com', password: DEMO_PASSWORD },
  { name: 'Charu Demo', email: 'charu.demo@example.com', password: DEMO_PASSWORD },
  { name: 'Dev Demo', email: 'dev.demo@example.com', password: DEMO_PASSWORD },
  { name: 'Esha Demo', email: 'esha.demo@example.com', password: DEMO_PASSWORD }
];

async function getOrCreateUser(details) {
  let user = await User.findOne({ email: details.email });
  if (!user) user = await User.create(details);
  return user;
}

function daysAgo(days, hour = 12) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

async function seed() {
  if (env.NODE_ENV === 'production' && !env.ALLOW_PROD_SEED) {
    logger.error('Refusing to seed database in production mode without ALLOW_PROD_SEED=true');
    process.exit(1);
  }

  notificationQueue.configured = false;

  await connectDatabase();
  logger.info('Connected to database for seeding');

  const users = await Promise.all(demoUsersData.map(getOrCreateUser));
  const [asha, bala, charu, dev, esha] = users;

  let goaGroup = await Group.findOne({ name: 'Goa Trip', createdBy: asha._id });
  if (!goaGroup) {
    goaGroup = await Group.create({
      name: 'Goa Trip',
      description: 'Annual beach vacation with friends',
      type: 'trip',
      emoji: '🏖️',
      currency: 'INR',
      createdBy: asha._id,
      members: [
        { user: asha._id, name: asha.name, role: 'admin' },
        { user: bala._id, name: bala.name, role: 'member' },
        { user: charu._id, name: charu.name, role: 'member' },
        { user: dev._id, name: dev.name, role: 'member' },
        { user: null, name: 'Kavita (offline)', role: 'member' }
      ],
      invite: { code: generateInviteCode() }
    });
  }

  let flatGroup = await Group.findOne({ name: 'Flat 402', createdBy: asha._id });
  if (!flatGroup) {
    flatGroup = await Group.create({
      name: 'Flat 402',
      description: 'Shared apartment expenses and monthly utilities',
      type: 'home',
      emoji: '🏠',
      currency: 'INR',
      createdBy: asha._id,
      members: [
        { user: asha._id, name: asha.name, role: 'admin' },
        { user: bala._id, name: bala.name, role: 'member' },
        { user: dev._id, name: dev.name, role: 'member' }
      ],
      invite: { code: generateInviteCode() }
    });
  }

  let coupleGroup = await Group.findOne({ name: 'Couple Weekend', createdBy: asha._id });
  if (!coupleGroup) {
    coupleGroup = await Group.create({
      name: 'Couple Weekend',
      description: 'Dinners, movies, and coffee dates',
      type: 'couple',
      emoji: '☕',
      currency: 'INR',
      createdBy: asha._id,
      members: [
        { user: asha._id, name: asha.name, role: 'admin' },
        { user: bala._id, name: bala.name, role: 'member' }
      ],
      invite: { code: generateInviteCode() }
    });
  }

  const goaMembers = goaGroup.activeMembers();
  const flatMembers = flatGroup.activeMembers();
  const coupleMembers = coupleGroup.activeMembers();

  const goaHasExpenses = await Expense.exists({ group: goaGroup._id });
  if (!goaHasExpenses) {
    const goaSpecs = [

      { desc: 'Flight tickets booking', amt: 18000, cat: 'transport', payer: 0, date: daysAgo(75), type: 'EQUAL', splits: goaMembers.map(m => ({ member: m._id })) },
      { desc: 'Villa advance deposit', amt: 12000, cat: 'stay', payer: 1, date: daysAgo(70), type: 'EQUAL', splits: goaMembers.map(m => ({ member: m._id })) },
      { desc: 'Airport cab to hotel', amt: 1800, cat: 'transport', payer: 2, date: daysAgo(68), type: 'EQUAL', splits: goaMembers.map(m => ({ member: m._id })) },
      { desc: 'Welcome sea-food dinner', amt: 4200, cat: 'food', payer: 0, date: daysAgo(66), type: 'EQUAL', splits: goaMembers.map(m => ({ member: m._id })) },
      { desc: 'Scooter rentals for 4 days', amt: 3200, cat: 'transport', payer: 3, date: daysAgo(65), type: 'EQUAL', splits: goaMembers.slice(0, 4).map(m => ({ member: m._id })) },

      { desc: 'Beach shack lunch & drinks', amt: 3500, cat: 'food', payer: 1, date: daysAgo(48), type: 'EQUAL', splits: goaMembers.map(m => ({ member: m._id })) },
      { desc: 'Scuba diving & water sports', amt: 10000, cat: 'entertainment', payer: 0, date: daysAgo(45), type: 'EXACT', splits: goaMembers.slice(0, 4).map(m => ({ member: m._id, amount: toPaise(2500) })) },
      { desc: 'Supermarket supplies & sunscreen', amt: 2450, cat: 'groceries', payer: 2, date: daysAgo(42), type: 'EQUAL', splits: goaMembers.map(m => ({ member: m._id })) },
      { desc: 'Sunset cruise tickets', amt: 5000, cat: 'entertainment', payer: 3, date: daysAgo(39), type: 'PERCENTAGE', splits: [
        { member: goaMembers[0]._id, percentage: 25 },
        { member: goaMembers[1]._id, percentage: 25 },
        { member: goaMembers[2]._id, percentage: 25 },
        { member: goaMembers[3]._id, percentage: 25 }
      ] },
      { desc: 'Club entry & VIP table', amt: 8000, cat: 'entertainment', payer: 1, date: daysAgo(36), type: 'SHARES', splits: [
        { member: goaMembers[0]._id, shares: 2 },
        { member: goaMembers[1]._id, shares: 2 },
        { member: goaMembers[2]._id, shares: 1 },
        { member: goaMembers[3]._id, shares: 1 }
      ] },

      { desc: 'Old Goa museum tour tickets', amt: 1200, cat: 'entertainment', payer: 0, date: daysAgo(22), type: 'EQUAL', splits: goaMembers.map(m => ({ member: m._id })) },
      { desc: 'Traditional Goan fish thali', amt: 2800, cat: 'food', payer: 2, date: daysAgo(18), type: 'EQUAL', splits: goaMembers.map(m => ({ member: m._id })) },
      { desc: 'Souvenirs, cashew & feni shopping', amt: 4600, cat: 'shopping', payer: 3, date: daysAgo(12), type: 'EQUAL', splits: goaMembers.map(m => ({ member: m._id })) },
      { desc: 'Return airport taxi', amt: 1950, cat: 'transport', payer: 1, date: daysAgo(8), type: 'EQUAL', splits: goaMembers.map(m => ({ member: m._id })) },
      { desc: 'Farewell dessert & coffee', amt: 1350, cat: 'food', payer: 0, date: daysAgo(4), type: 'EQUAL', splits: goaMembers.map(m => ({ member: m._id })) }
    ];

    for (const item of goaSpecs) {
      const total = toPaise(item.amt);
      const payerMember = goaMembers[item.payer]._id;
      const creatorUser = goaMembers[item.payer].user ? users.find(u => u._id.equals(goaMembers[item.payer].user)) : asha;

      const expense = await Expense.create({
        group: goaGroup._id,
        description: item.desc,
        amount: total,
        currency: goaGroup.currency,
        category: item.cat,
        date: item.date,
        paidBy: [{ member: payerMember, amount: total }],
        splitType: item.type,
        splits: calculateSplits({
          splitType: item.type,
          total,
          splits: item.splits
        }),
        createdBy: creatorUser._id
      });

      if (item.cat === 'stay') {
        await addExpenseComment(expense, goaGroup, asha, 'Booking confirmed with free breakfast!');
      } else if (item.cat === 'entertainment' && item.amt > 5000) {
        await addExpenseComment(expense, goaGroup, bala, 'Amazing night, totally worth it!');
      }
    }
  }

  const flatHasExpenses = await Expense.exists({ group: flatGroup._id });
  if (!flatHasExpenses) {
    const flatSpecs = [

      { desc: 'August High-speed WiFi', amt: 1499, cat: 'bills', payer: 0, date: daysAgo(62) },
      { desc: 'August Groceries & vegetables', amt: 6500, cat: 'groceries', payer: 1, date: daysAgo(58) },
      { desc: 'Electricity bill (August)', amt: 3200, cat: 'bills', payer: 2, date: daysAgo(55) },
      { desc: 'Cleaning supplies & maid fee', amt: 4000, cat: 'general', payer: 0, date: daysAgo(52) },

      { desc: 'September WiFi fiber connection', amt: 1499, cat: 'bills', payer: 0, date: daysAgo(32) },
      { desc: 'September Groceries stockup', amt: 7200, cat: 'groceries', payer: 1, date: daysAgo(28) },
      { desc: 'Electricity bill (September)', amt: 2850, cat: 'bills', payer: 2, date: daysAgo(25) },
      { desc: 'Water purifier filter change', amt: 1800, cat: 'bills', payer: 0, date: daysAgo(22) },

      { desc: 'October WiFi subscription', amt: 1499, cat: 'bills', payer: 0, date: daysAgo(7) },
      { desc: 'Weekly veggies & snacks', amt: 2300, cat: 'groceries', payer: 1, date: daysAgo(5) },
      { desc: 'Piped gas cylinder refill', amt: 1150, cat: 'bills', payer: 2, date: daysAgo(2) }
    ];

    for (const item of flatSpecs) {
      const total = toPaise(item.amt);
      const payer = flatMembers[item.payer];
      await Expense.create({
        group: flatGroup._id,
        description: item.desc,
        amount: total,
        currency: flatGroup.currency,
        category: item.cat,
        date: item.date,
        paidBy: [{ member: payer._id, amount: total }],
        splitType: 'EQUAL',
        splits: calculateSplits({
          splitType: 'EQUAL',
          total,
          splits: flatMembers.map(m => ({ member: m._id }))
        }),
        createdBy: users.find(u => u._id.equals(payer.user))._id
      });
    }

    const hasRecurring = await RecurringExpense.exists({ group: flatGroup._id });
    if (!hasRecurring) {
      const rentPaise = toPaise(30000);
      await RecurringExpense.create({
        group: flatGroup._id,
        description: 'Monthly Flat Rent',
        amount: rentPaise,
        currency: 'INR',
        category: 'rent',
        notes: 'Due on 1st of every month to landlord',
        paidBy: [{ member: flatMembers[0]._id, amount: rentPaise }],
        splitType: 'EQUAL',
        splits: flatMembers.map(m => ({ member: m._id })),
        frequency: 'monthly',
        anchorDay: 1,
        nextRunAt: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 1, 0, 0, 0)),
        createdBy: asha._id
      });
    }
  }

  const coupleHasExpenses = await Expense.exists({ group: coupleGroup._id });
  if (!coupleHasExpenses) {
    const coupleSpecs = [
      { desc: 'Italian dinner & wine', amt: 3200, cat: 'food', payer: 0, date: daysAgo(40) },
      { desc: 'IMAX movie tickets & popcorn', amt: 1600, cat: 'entertainment', payer: 1, date: daysAgo(30) },
      { desc: 'Art exhibition entry', amt: 800, cat: 'entertainment', payer: 0, date: daysAgo(20) },
      { desc: 'Specialty cafe brunch', amt: 1450, cat: 'food', payer: 1, date: daysAgo(10) },
      { desc: 'Weekend boutique shopping', amt: 4500, cat: 'shopping', payer: 0, date: daysAgo(3) }
    ];

    for (const item of coupleSpecs) {
      const total = toPaise(item.amt);
      const payer = coupleMembers[item.payer];
      await Expense.create({
        group: coupleGroup._id,
        description: item.desc,
        amount: total,
        currency: coupleGroup.currency,
        category: item.cat,
        date: item.date,
        paidBy: [{ member: payer._id, amount: total }],
        splitType: 'EQUAL',
        splits: calculateSplits({
          splitType: 'EQUAL',
          total,
          splits: coupleMembers.map(m => ({ member: m._id }))
        }),
        createdBy: users.find(u => u._id.equals(payer.user))._id
      });
    }

    const hasSettlement = await Settlement.exists({ group: coupleGroup._id });
    if (!hasSettlement) {

      await Settlement.create({
        group: coupleGroup._id,
        from: coupleMembers[1]._id,
        to: coupleMembers[0]._id,
        amount: toPaise(1500),
        method: 'upi',
        note: 'UPI transfer for last month dates',
        date: daysAgo(1),
        createdBy: bala._id
      });

      await Settlement.create({
        group: goaGroup._id,
        from: goaMembers[1]._id,
        to: goaMembers[0]._id,
        amount: toPaise(2000),
        method: 'cash',
        note: 'Cash payment (voided due to recount)',
        date: daysAgo(15),
        status: 'void',
        isDeleted: true,
        deletedAt: daysAgo(14),
        deletedBy: asha._id,
        createdBy: bala._id
      });
    }
  }

  const totalUsers = await User.countDocuments({ email: { $regex: /@example\.com$/ } });
  const totalGroups = await Group.countDocuments({ _id: { $in: [goaGroup._id, flatGroup._id, coupleGroup._id] } });
  const totalExpenses = await Expense.countDocuments({ group: { $in: [goaGroup._id, flatGroup._id, coupleGroup._id] } });
  const totalSettlements = await Settlement.countDocuments({ group: { $in: [goaGroup._id, flatGroup._id, coupleGroup._id] } });
  const totalRecurring = await RecurringExpense.countDocuments({ group: { $in: [goaGroup._id, flatGroup._id, coupleGroup._id] } });

  console.log('\n======================================================');
  console.log('   🎉 DEMO DATA SEEDED SUCCESSFULLY!                 ');
  console.log('======================================================');
  console.log(` Demo Users Created : ${totalUsers}`);
  console.log(` Groups Created     : ${totalGroups} (Goa Trip, Flat 402, Couple Weekend)`);
  console.log(` Expenses Logged    : ${totalExpenses} (spread across 3 months with 4 split types)`);
  console.log(` Settlements Logged : ${totalSettlements} (including 1 voided settlement)`);
  console.log(` Recurring Templates: ${totalRecurring} (Monthly Rent template)`);
  console.log('------------------------------------------------------');
  console.log(' Demo Login Accounts (Password for all: DemoPass123):');
  for (const u of demoUsersData) {
    console.log(`   - ${u.name.padEnd(12)}: ${u.email}`);
  }
  console.log('======================================================\n');
}

seed()
  .catch((error) => {
    logger.error('Could not seed demo data', { message: error.message, stack: error.stack });
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });