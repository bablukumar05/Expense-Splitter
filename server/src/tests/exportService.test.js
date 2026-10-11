import test from 'node:test';
import assert from 'node:assert/strict';
import Expense from '../models/Expense.js';
import { createGroupSummaryPdf, exportGroupCsv } from '../services/export.service.js';

test('CSV export quotes fields, identifies currencies, and neutralizes formula injection', async () => {
  const originalFind = Expense.find;
  const date = new Date('2026-10-01T00:00:00.000Z');
  const expense = {
    date,
    description: '=HYPERLINK("https://bad.example")',
    category: 'food',
    amount: 10050,
    currency: 'INR',
    paidBy: [{ member: 'member-a', amount: 10050 }],
    splitType: 'EQUAL',
    splits: [{ member: 'member-a', owedAmount: 10050 }],
    notes: '+SUM(A1:A2)'
  };
  Expense.find = () => ({
    sort: async () => [expense]
  });
  const group = {
    _id: 'group-id',
    members: { id: () => ({ name: 'Asha' }) }
  };

  try {
    const csv = await exportGroupCsv(group);
    assert.match(csv, /"'=HYPERLINK/);
    assert.match(csv, /"Asha:100\.5 INR"/);
    assert.match(csv, /"'\+SUM/);
  } finally {
    Expense.find = originalFind;
  }
});

test('PDF summary export produces a valid PDF stream', async () => {
  const originalAggregate = Expense.aggregate;
  const originalCount = Expense.countDocuments;
  Expense.aggregate = () => Promise.resolve([]);
  Expense.countDocuments = async () => 0;
  const group = { _id: 'group-id', name: 'Demo group', currency: 'INR', members: { id: () => null } };

  try {
    const document = await createGroupSummaryPdf(group);
    const chunks = [];
    document.on('data', (chunk) => chunks.push(chunk));
    const finished = new Promise((resolve, reject) => {
      document.once('end', resolve);
      document.once('error', reject);
    });
    document.end();
    await finished;
    const pdf = Buffer.concat(chunks);
    assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  } finally {
    Expense.aggregate = originalAggregate;
    Expense.countDocuments = originalCount;
  }
});