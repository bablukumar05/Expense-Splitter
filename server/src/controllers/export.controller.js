import { createGroupSummaryPdf, exportGroupCsv } from '../services/export.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const exportGroup = asyncHandler(async (request, response) => {
  const format = request.validated.query.format;
  const filename = `expense-group-${request.group.id}`;

  if (format === 'csv') {
    const csv = await exportGroupCsv(request.group);
    response.status(200).set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}.csv"`
    }).send(`\uFEFF${csv}`);
    return;
  }

  const pdf = await createGroupSummaryPdf(request.group);
  response.status(200)
    .type('application/pdf')
    .attachment(`${filename}.pdf`);
  pdf.pipe(response);
  pdf.end();
});