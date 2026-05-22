import { MercadoPagoConfig, Payment } from 'mercadopago';

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';

const client = new MercadoPagoConfig({
  accessToken,
  options: { timeout: 15000 }
});

const paymentClient = new Payment(client);

export interface PixChargeResult {
  mpPaymentId: number;
  qrCode: string;
  qrCodeBase64: string;
  copiaECola: string;
  expiration: string;
}

export async function createPixCharge(
  amount: number,
  payerEmail: string,
  description: string,
  notificationUrl: string,
  idempotencyKey?: string
): Promise<PixChargeResult> {
  const body: any = {
    transaction_amount: amount,
    description,
    payment_method_id: 'pix',
    notification_url: notificationUrl,
    payer: { email: payerEmail },
  };

  const requestOptions: any = {};
  if (idempotencyKey) {
    requestOptions.headers = { 'x-idempotency-key': idempotencyKey };
  }

  const response = await paymentClient.create({ body, requestOptions });

  const pixData = response.point_of_interaction?.transaction_data;

  return {
    mpPaymentId: response.id!,
    qrCode: pixData?.qr_code || '',
    qrCodeBase64: pixData?.qr_code_base64 || '',
    copiaECola: pixData?.qr_code || '',
    expiration: response.date_of_expiration || '',
  };
}

export async function getPaymentStatus(mpPaymentId: number): Promise<{
  status: string;
  statusDetail: string;
  paidAt: string | null;
}> {
  const response = await paymentClient.get({ id: mpPaymentId });
  return {
    status: response.status || '',
    statusDetail: response.status_detail || '',
    paidAt: response.date_approved || null,
  };
}

export async function sendPixTransfer(
  amount: number,
  pixKey: string,
  description: string,
  payerEmail: string,
  idempotencyKey?: string
): Promise<{ mpTransferId: string }> {
  const body: any = {
    transaction_amount: amount,
    description,
    payment_method_id: 'pix',
    payer: { email: payerEmail },
    additional_info: {
      pix_key: pixKey,
    },
  };

  const requestOptions: any = {};
  if (idempotencyKey) {
    requestOptions.headers = { 'x-idempotency-key': idempotencyKey };
  }

  const response = await paymentClient.create({ body, requestOptions });

  return {
    mpTransferId: String(response.id),
  };
}

export function validateWebhook(signature: string | null, body: any): boolean {
  if (!signature) return false;
  try {
    const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
    if (!webhookSecret) return true;
    const crypto = require('crypto');
    const parts = signature.split(',');
    const tsPart = parts.find((p: string) => p.trim().startsWith('ts='));
    const hashPart = parts.find((p: string) => p.trim().startsWith('v1='));
    if (!tsPart || !hashPart) return false;
    const ts = tsPart.split('=')[1].trim();
    const hash = hashPart.split('=')[1].trim();
    const manifest = `id:${body?.id};request-id:${body?.request_id || ''};ts:${ts};`;
    const expected = crypto.createHmac('sha256', webhookSecret).update(manifest).digest('hex');
    return hash === expected;
  } catch {
    return false;
  }
}
