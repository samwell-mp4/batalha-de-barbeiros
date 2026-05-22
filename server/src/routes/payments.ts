import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { createPixCharge, getPaymentStatus, sendPixTransfer, validateWebhook } from '../services/mercadopago';

const router = Router();

const NOTIFICATION_URL = process.env.APP_URL
  ? `${process.env.APP_URL}/api/payments/webhook`
  : 'https://battlebarber.app/api/payments/webhook';

router.post('/create-pix', async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) {
      return res.status(400).json({ error: 'appointmentId é obrigatório' });
    }

    const appointment = await (prisma as any).appointment.findUnique({
      where: { id: appointmentId },
      include: { client: true, barber: { include: { user: true } } },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    if (!appointment.barber) {
      return res.status(400).json({ error: 'Barbeiro não vinculado ao agendamento' });
    }

    const barberPixKey = appointment.barber.pixKey;
    if (!barberPixKey) {
      return res.status(400).json({ error: 'Barbeiro não possui chave PIX cadastrada' });
    }

    const amount = appointment.price;
    const fee = 1.0;
    const barberAmount = amount - fee;

    const idempotencyKey = `pix_${appointmentId}`;

    const pixResult = await createPixCharge(
      amount,
      appointment.client.email,
      `Battle Barber - ${appointment.services?.join(', ') || 'Serviços'}`,
      NOTIFICATION_URL,
      idempotencyKey
    );

    let payment = await (prisma as any).payment.findUnique({
      where: { appointmentId },
    });

    if (payment) {
      payment = await (prisma as any).payment.update({
        where: { id: payment.id },
        data: {
          amount,
          fee,
          barberAmount,
          status: 'PENDING',
          mpPaymentId: pixResult.mpPaymentId,
          mpQrCode: pixResult.qrCode,
          mpQrCodeBase64: pixResult.qrCodeBase64,
          mpCopiaECola: pixResult.copiaECola,
          pixKey: appointment.paymentMethod || 'pix',
          barberPixKey,
          transferStatus: 'PENDING',
        },
      });
    } else {
      payment = await (prisma as any).payment.create({
        data: {
          appointmentId,
          clientId: appointment.clientId,
          barberId: appointment.barberId,
          amount,
          fee,
          barberAmount,
          status: 'PENDING',
          mpPaymentId: pixResult.mpPaymentId,
          mpQrCode: pixResult.qrCode,
          mpQrCodeBase64: pixResult.qrCodeBase64,
          mpCopiaECola: pixResult.copiaECola,
          pixKey: appointment.paymentMethod || 'pix',
          barberPixKey,
          transferStatus: 'PENDING',
        },
      });
    }

    return res.json({
      id: payment.id,
      appointmentId: payment.appointmentId,
      amount: payment.amount,
      fee: payment.fee,
      barberAmount: payment.barberAmount,
      status: payment.status,
      mpQrCodeBase64: payment.mpQrCodeBase64,
      mpCopiaECola: payment.mpCopiaECola,
      expiration: pixResult.expiration,
    });
  } catch (error: any) {
    console.error('[PAYMENTS] Erro ao criar PIX:', error);
    return res.status(500).json({ error: error.message || 'Erro ao criar cobrança PIX' });
  }
});

router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-signature'] as string | null;

    if (!validateWebhook(signature, req.body)) {
      console.warn('[PAYMENTS] Webhook com assinatura inválida ignorado');
      return res.status(200).json({ received: true });
    }

    const { action, data, type } = req.body;

    if (!data || !data.id) {
      return res.status(200).json({ received: true });
    }

    const mpPaymentId = data.id;
    const paymentStatus = await getPaymentStatus(mpPaymentId);

    console.log(`[PAYMENTS] Webhook recebido - MP ID: ${mpPaymentId}, Status: ${paymentStatus.status}`);

    if (paymentStatus.status === 'approved') {
      const payment = await (prisma as any).payment.findFirst({
        where: { mpPaymentId },
        include: {
          barber: true,
          appointment: { include: { client: true } },
        },
      });

      if (!payment) {
        console.warn(`[PAYMENTS] Pagamento MP ID ${mpPaymentId} não encontrado no DB`);
        return res.status(200).json({ received: true });
      }

      await (prisma as any).payment.update({
        where: { id: payment.id },
        data: {
          status: 'APPROVED',
          paidAt: paymentStatus.paidAt ? new Date(paymentStatus.paidAt) : new Date(),
        },
      });

      if (payment.barberPixKey) {
        try {
          console.log(`[PAYMENTS] Transferindo R$ ${payment.barberAmount} para PIX ${payment.barberPixKey}`);
          const transferIdempotencyKey = `transfer_${payment.id}`;
          const transferResult = await sendPixTransfer(
            payment.barberAmount,
            payment.barberPixKey,
            `Repasse Battle Barber - #${payment.appointmentId.slice(0, 8)}`,
            payment.appointment.client.email,
            transferIdempotencyKey
          );

          await (prisma as any).payment.update({
            where: { id: payment.id },
            data: {
              mpTransferId: transferResult.mpTransferId,
              transferStatus: 'COMPLETED',
            },
          });

          console.log(`[PAYMENTS] Transferência concluída: ${transferResult.mpTransferId}`);
        } catch (transferError: any) {
          console.error(`[PAYMENTS] Erro na transferência PIX:`, transferError);
          await (prisma as any).payment.update({
            where: { id: payment.id },
            data: { transferStatus: 'FAILED' },
          });
        }
      }

      await (prisma as any).appointment.update({
        where: { id: payment.appointmentId },
        data: { status: 'COMPLETED' },
      });

      console.log(`[PAYMENTS] Pagamento ${mpPaymentId} processado com sucesso!`);
    } else if (['rejected', 'refunded', 'cancelled'].includes(paymentStatus.status)) {
      await (prisma as any).payment.updateMany({
        where: { mpPaymentId },
        data: { status: paymentStatus.status.toUpperCase() as any },
      });
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('[PAYMENTS] Erro no webhook:', error);
    return res.status(200).json({ received: true });
  }
});

router.get('/:appointmentId', async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const payment = await (prisma as any).payment.findUnique({
      where: { appointmentId },
    });

    if (!payment) {
      return res.json({ status: null });
    }

    return res.json({
      id: payment.id,
      appointmentId: payment.appointmentId,
      amount: payment.amount,
      fee: payment.fee,
      barberAmount: payment.barberAmount,
      status: payment.status,
      transferStatus: payment.transferStatus,
      paidAt: payment.paidAt,
      mpQrCodeBase64: payment.mpQrCodeBase64,
      mpCopiaECola: payment.mpCopiaECola,
    });
  } catch (error: any) {
    console.error('[PAYMENTS] Erro ao buscar pagamento:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.put('/barber-pix-key', async (req: Request, res: Response) => {
  try {
    const { barberId, pixKey } = req.body;
    if (!barberId || !pixKey) {
      return res.status(400).json({ error: 'barberId e pixKey são obrigatórios' });
    }

    const barber = await (prisma as any).barber.update({
      where: { id: barberId },
      data: { pixKey },
    });

    return res.json({ success: true, pixKey: barber.pixKey });
  } catch (error: any) {
    console.error('[PAYMENTS] Erro ao salvar chave PIX:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
