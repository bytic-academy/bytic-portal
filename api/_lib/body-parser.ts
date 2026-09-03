import type { IncomingMessage } from 'node:http';
import { z } from 'zod';

/**
 * Parse and validate a JSON request body against a Zod schema.
 * Reads the raw Node.js request stream, parses JSON, and validates.
 */
export async function parseBody<T>(
  req: IncomingMessage,
  schema: z.ZodType<T>
): Promise<T> {
  const raw = await readBody(req);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ValidationError('Invalid JSON in request body');
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    const messages = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
    throw new ValidationError(`Validation failed: ${messages.join(', ')}`);
  }

  return result.data;
}

/**
 * Read the raw body from a Node.js IncomingMessage as a string.
 */
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
