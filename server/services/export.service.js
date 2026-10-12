import PDFDocument from 'pdfkit';
import Expense from '../models/Expense.js';
import { fromPaise } from '../utils/money.js';
import { getGroupStats } from './analytics.service.js';
import { AppError } from '../utils/AppError.js';

function csvCell(value) {
  let text = value == null ? '' : String(value);
  if (/^[\s]*[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function buildExportFilter(group, options = {}) {
  const filter = { group: group._id, isDeleted: false };
  if (options.category) filter.category = options.category;
  if (options.member) {
    filter.$or = [
      { 'paidBy.member': options.member },
      { 'splits.member': options.member }
    ];
  }
  if (options.fromDate || options.toDate) {
    filter.date = {};
    if (options.fromDate) filter.date.$gte = new Date(options.fromDate);
    if (options.toDate) filter.date.$lte = new Date(options.toDate);
  }
  return filter;
}

export async function exportGroupCsv(group, options = {}) {
  const filter = buildExportFilter(group, options);
  const expenses = await Expense.find(filter).sort({ date: 1, _id: 1 });
  const rows = [[
    'date', 'description', 'category', 'amount', 'currency', 'paid_by', 'split_type', 'splits', 'notes'
  ]];

  for (const expense of expenses) {
    rows.push([
      expense.date.toISOString(),
      expense.description,
      expense.category,
      fromPaise(expense.amount),
      expense.currency,
      expense.paidBy.map((payer) => {
        const member = group.members.id(payer.member);
        return `${member?.name ?? payer.member}:${fromPaise(payer.amount)} ${expense.currency}`;
      }).join('; '),
      expense.splitType,
      expense.splits.map((split) => {
        const member = group.members.id(split.member);
        return `${member?.name ?? split.member}:${fromPaise(split.owedAmount)} ${expense.currency}`;
      }).join('; '),
      expense.notes
    ]);
  }

  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
}

export async function streamGroupCsv(group, writeStream, options = {}) {
  const filter = buildExportFilter(group, options);
  writeStream.write('\uFEFF');

  const headers = ['date', 'description', 'category', 'amount', 'currency', 'paid_by', 'split_type', 'splits', 'notes'];
  writeStream.write(headers.map(csvCell).join(',') + '\r\n');

  const query = Expense.find(filter).sort({ date: 1, _id: 1 });
  if (typeof query.cursor !== 'function') {
    const expenses = await query;
    for (const expense of expenses) {
      const row = [
        expense.date.toISOString(),
        expense.description,
        expense.category,
        fromPaise(expense.amount),
        expense.currency,
        expense.paidBy.map((payer) => {
          const member = group.members?.id?.(payer.member);
          return `${member?.name ?? payer.member}:${fromPaise(payer.amount)} ${expense.currency}`;
        }).join('; '),
        expense.splitType,
        expense.splits.map((split) => {
          const member = group.members?.id?.(split.member);
          return `${member?.name ?? split.member}:${fromPaise(split.owedAmount)} ${expense.currency}`;
        }).join('; '),
        expense.notes
      ];
      writeStream.write(row.map(csvCell).join(',') + '\r\n');
    }
    return;
  }

  const cursor = query.cursor();
  let rowCount = 0;
  const maxRows = 10000;

  for await (const expense of cursor) {
    rowCount += 1;
    if (rowCount > maxRows) break;
    const row = [
      expense.date.toISOString(),
      expense.description,
      expense.category,
      fromPaise(expense.amount),
      expense.currency,
      expense.paidBy.map((payer) => {
        const member = group.members?.id?.(payer.member);
        return `${member?.name ?? payer.member}:${fromPaise(payer.amount)} ${expense.currency}`;
      }).join('; '),
      expense.splitType,
      expense.splits.map((split) => {
        const member = group.members?.id?.(split.member);
        return `${member?.name ?? split.member}:${fromPaise(split.owedAmount)} ${expense.currency}`;
      }).join('; '),
      expense.notes
    ];
    writeStream.write(row.map(csvCell).join(',') + '\r\n');
  }
}

export async function createGroupSummaryPdf(group, options = {}) {
  const filter = buildExportFilter(group, options);
  const count = await Expense.countDocuments(filter);
  if (count > 500) {
    throw new AppError('PDF export exceeds the limit of 500 expenses. Please select a shorter date range or export as CSV.', 400);
  }

  const stats = await getGroupStats(group, options);
  const document = new PDFDocument({ size: 'A4', margin: 48, info: { Title: `${group.name} expense summary` } });

  document.fontSize(22).text(group.name, { continued: false });
  document.moveDown(0.3).fontSize(11).fillColor('#52606d').text(`Currency: ${group.currency}`);
  document.moveDown().fillColor('#102a43').fontSize(14).text('Spending summary');
  document.fontSize(11).text(`Total spend: ${stats.totalSpend.toFixed(2)} ${group.currency}`);
  document.text(`Expenses: ${stats.expenseCount}`);
  document.moveDown().fontSize(14).text('Spend by category');
  for (const entry of stats.spendByCategory) {
    document.fontSize(10).text(`${entry.category}: ${entry.amount.toFixed(2)} ${group.currency}`);
  }
  document.moveDown().fontSize(14).text('Spend per member (split share)');
  for (const entry of stats.spendPerMember) {
    document.fontSize(10).text(`${entry.name}: ${entry.amount.toFixed(2)} ${group.currency}`);
  }
  document.moveDown().fontSize(14).text('Monthly trend');
  for (const entry of stats.monthlyTrend) {
    document.fontSize(10).text(`${entry.month}: ${entry.amount.toFixed(2)} ${group.currency}`);
  }
  if (stats.topSpender) {
    document.moveDown().fontSize(11).text(
      `Top spender: ${stats.topSpender.name} (${stats.topSpender.amount.toFixed(2)} ${group.currency})`
    );
  }

  document.moveDown(2).fontSize(9).fillColor('#829ab1')
    .text(`Generated on: ${new Date().toISOString()} | Timezone: ${options.timezone || 'Asia/Kolkata'}`);

  return document;
}