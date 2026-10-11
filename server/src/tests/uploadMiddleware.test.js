import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { uploadReceipt } from '../middleware/upload.js';

process.env.NODE_ENV = 'test';
process.env.MONGO_URI ??= 'mongodb://127.0.0.1:27017/expense_splitter_test';
process.env.JWT_ACCESS_SECRET ??= 'test-secret-with-at-least-32-characters';
delete process.env.CLOUDINARY_CLOUD_NAME;
delete process.env.CLOUDINARY_API_KEY;
delete process.env.CLOUDINARY_API_SECRET;

const { errorHandler } = await import('../middleware/errorHandler.js');
const { attachReceipt } = await import('../services/receipt.service.js');

async function withUploadServer(callback) {
  const app = express();
  app.post('/receipt', uploadReceipt, (request, response) => response.json({ uploaded: Boolean(request.file) }));
  app.use(errorHandler);

  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    await callback(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test('receipt middleware rejects non-image files with HTTP 400', async () => {
  await withUploadServer(async (baseUrl) => {
    const form = new FormData();
    form.append('receipt', new Blob(['pdf-data'], { type: 'application/pdf' }), 'receipt.pdf');
    const response = await fetch(`${baseUrl}/receipt`, { method: 'POST', body: form });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.match(body.message, /JPG, PNG, or WEBP/);
  });
});

test('receipt middleware rejects files larger than 5 MiB with HTTP 400', async () => {
  await withUploadServer(async (baseUrl) => {
    const form = new FormData();
    form.append('receipt', new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], { type: 'image/jpeg' }), 'large.jpg');
    const response = await fetch(`${baseUrl}/receipt`, { method: 'POST', body: form });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.message, 'Image must be 5 MB or smaller');
  });
});

test('receipt service returns 503 when Cloudinary is not configured', async () => {
  await assert.rejects(
    attachReceipt({}, { buffer: Buffer.from('receipt') }),
    { statusCode: 503, message: 'Receipt upload is not configured' }
  );
});

test('Mongoose validation errors are returned as client errors with field details', () => {
  let statusCode;
  let responseBody;
  const response = {
    status(status) {
      statusCode = status;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    }
  };

  errorHandler({
    name: 'ValidationError',
    errors: { amount: { path: 'amount', message: 'Amount must be integer paise' } }
  }, {}, response, () => {});

  assert.equal(statusCode, 400);
  assert.equal(responseBody.success, false);
  assert.equal(responseBody.data[0].field, 'amount');
});