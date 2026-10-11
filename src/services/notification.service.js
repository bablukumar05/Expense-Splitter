import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { escapeHtml } from '../utils/escapeHtml.js';
import { formatMoney } from '../utils/money.js';
import { notificationQueue } from './notificationQueue.js';
import { logger } from '../utils/logger.js';

const safeHeader = (value) => String(value ?? '').replace(/[\r\n\t]+/g, ' ').trim();
const groupLink = (group) => new URL(`/groups/${group._id}`, env.FRONTEND_URL).toString();

function emailHtml({ title, lines, button, link }) {
  return `<div style="background:#f4f6fb;padding:16px;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:480px;width:100%;margin:0 auto;background:#fff;border-radius:8px;padding:24px;box-sizing:border-box">
    <h2 style="margin:0 0 12px;font-size:20px;color:#111827">${escapeHtml(title)}</h2>
    ${lines.map((line) => `<p style="margin:0 0 10px;font-size:15px;line-height:1.5;color:#374151">${line}</p>`).join('')}
    <a href="${escapeHtml(link)}" style="display:block;text-align:center;background:#176b55;color:#fff;text-decoration:none;padding:12px 16px;border-radius:6px;margin-top:16px;font-weight:bold">${escapeHtml(button)}</a>
    <p style="margin:16px 0 0;font-size:12px;color:#6b7280">You can turn these emails off from your profile settings.</p>
  </div>
</div>`;
}

async function getOptedInUsers(userIds) {
  const uniqueIds = [...new Set(userIds.filter(Boolean).map(String))];
  if (uniqueIds.length === 0) return [];
  return User.find({
    _id: { $in: uniqueIds },
    'notifications.email': { $ne: false }
  }).select('name email');
}

function queueEmail({ to, subject, text, html }) {
  if (!to) return;
  notificationQueue.enqueue({ to, subject: safeHeader(subject), text, html });
}

export async function notifyNewExpense(group, actor, expense) {
  try {
    const owed = new Map(expense.splits.map((split) => [String(split.member), split.owedAmount]));
    const paid = new Map(expense.paidBy.map((payer) => [String(payer.member), payer.amount]));
    const memberIds = new Set([...owed.keys(), ...paid.keys()]);
    const recipientsByMember = group.members
      .filter((member) => member.user && memberIds.has(String(member._id)) && String(member.user) !== String(actor._id));
    const users = await getOptedInUsers(recipientsByMember.map((member) => member.user));
    const usersById = new Map(users.map((user) => [String(user._id), user]));

    for (const member of recipientsByMember) {
      const user = usersById.get(String(member.user));
      if (!user?.email) continue;
      const lines = [
        `<b>${escapeHtml(actor.name)}</b> added <b>${escapeHtml(expense.description)}</b> (${escapeHtml(formatMoney(expense.amount, expense.currency))}) in <b>${escapeHtml(group.name)}</b>.`
      ];
      if ((paid.get(String(member._id)) ?? 0) > 0) {
        lines.push(`You paid: <b>${escapeHtml(formatMoney(paid.get(String(member._id)), expense.currency))}</b>`);
      }
      if ((owed.get(String(member._id)) ?? 0) > 0) {
        lines.push(`Your share: <b>${escapeHtml(formatMoney(owed.get(String(member._id)), expense.currency))}</b>`);
      }
      queueEmail({
        to: user.email,
        subject: `New expense in "${group.name}"`,
        text: `${actor.name} added "${expense.description}" in ${group.name}.`,
        html: emailHtml({ title: 'New expense added', lines, button: 'View group', link: groupLink(group) })
      });
    }
  } catch (error) {
    logger.error('Failed to queue expense notifications', { message: error.message });
  }
}

export async function notifySettlementRecorded(group, actor, settlement) {
  try {
    const fromMember = group.members.id(settlement.from);
    const toMember = group.members.id(settlement.to);
    const userIds = [fromMember?.user, toMember?.user].filter((id) => id && String(id) !== String(actor._id));
    const users = await getOptedInUsers(userIds);
    const lines = [
      `<b>${escapeHtml(fromMember?.name ?? 'Unknown')}</b> paid <b>${escapeHtml(toMember?.name ?? 'Unknown')}</b> ${escapeHtml(formatMoney(settlement.amount, group.currency))}.`,
      `<b>${escapeHtml(actor.name)}</b> recorded this payment in <b>${escapeHtml(group.name)}</b>.`
    ];
    for (const user of users) {
      queueEmail({
        to: user.email,
        subject: `Payment recorded in "${group.name}"`,
        text: `${fromMember?.name ?? 'A member'} paid ${toMember?.name ?? 'a member'} ${formatMoney(settlement.amount, group.currency)}.`,
        html: emailHtml({ title: 'Payment recorded', lines, button: 'View balances', link: groupLink(group) })
      });
    }
  } catch (error) {
    logger.error('Failed to queue settlement notifications', { message: error.message });
  }
}

export async function notifyMemberJoined(group, newUser) {
  try {
    const adminIds = group.members
      .filter((member) => member.isActive && member.role === 'admin' && member.user && String(member.user) !== String(newUser._id))
      .map((member) => member.user);
    const users = await getOptedInUsers(adminIds);
    const lines = [`<b>${escapeHtml(newUser.name)}</b> joined <b>${escapeHtml(group.name)}</b> using the invite link.`];
    for (const user of users) {
      queueEmail({
        to: user.email,
        subject: `${newUser.name} joined "${group.name}"`,
        text: `${newUser.name} joined ${group.name} using the invite link.`,
        html: emailHtml({ title: 'New member joined', lines, button: 'View group', link: groupLink(group) })
      });
    }
  } catch (error) {
    logger.error('Failed to queue member-joined notifications', { message: error.message });
  }
}