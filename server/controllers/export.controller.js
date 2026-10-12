import { createGroupSummaryPdf, exportGroupCsv, streamGroupCsv } from '../services/export.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

export const exportGroup = asyncHandler(async (request, response) => {
  if (request.group.isArchived) {
    throw new AppError('Cannot export an archived group', 400);
  }

  const activeMember = request.group.findActiveMemberByUser(request.user._id);
  if (!activeMember) {
    throw new AppError('Only active group members can export group data', 403);
  }

  const { format, fromDate, toDate, category, member } = request.validated.query;
  const sanitizedGroupName = (request.group.name || 'group')
    .replace(/[^\w\s-]/gi, '')
    .trim()
    .replace(/\s+/g, '_') || 'group';
  const filename = `${sanitizedGroupName}_expenses_${new Date().toISOString().slice(0, 10)}`;

  if (format === 'csv') {
    response.status(200).set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}.csv"; filename*=UTF-8''${encodeURIComponent(filename)}.csv`
    });

    try {
      await streamGroupCsv(request.group, response, { fromDate, toDate, category, member });
      response.end();
    } catch {
      const csv = await exportGroupCsv(request.group, { fromDate, toDate, category, member });
      response.send(`\uFEFF${csv}`);
    }
    return;
  }

  const pdf = await createGroupSummaryPdf(request.group, { fromDate, toDate, category, member });
  response.status(200).set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}.pdf"; filename*=UTF-8''${encodeURIComponent(filename)}.pdf`
  });
  pdf.pipe(response);
  pdf.end();
});