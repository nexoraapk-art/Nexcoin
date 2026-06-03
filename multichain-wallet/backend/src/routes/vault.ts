import { Router, Request, Response } from 'express';
import { verifyAdminMnemonic, getVaultWallets, getVaultBalance } from '../services/vaultService';
import { prisma } from '../server';
import { deviceRateLimit } from '../middleware/rateLimit';
import { validateDeviceId } from '../middleware/deviceAuth';

const router = Router();

router.post(
  '/login',
  validateDeviceId,
  deviceRateLimit(3, 1),
  async (req: Request, res: Response) => {
    try {
      const { mnemonic } = req.body;
      const deviceId = (req as any).deviceId;

      if (!mnemonic) {
        return res.status(400).json({ error: 'Mnemonic is required' });
      }

      // Check lockout status
      const lockout = await prisma.lockout.findUnique({
        where: { deviceId },
      });

      if (lockout?.permanentLock) {
        return res.status(403).json({
          error: 'Device is permanently locked',
        });
      }

      if (lockout?.lockUntil && lockout.lockUntil > new Date()) {
        return res.status(429).json({
          error: 'Device is temporarily locked',
          lockUntil: lockout.lockUntil,
          remainingSeconds: Math.ceil((lockout.lockUntil.getTime() - Date.now()) / 1000),
        });
      }

      // Verify mnemonic
      const isValid = verifyAdminMnemonic(mnemonic);

      if (!isValid) {
        const attempts = (lockout?.attempts || 0) + 1;
        const maxAttempts = 5;

        if (attempts >= maxAttempts) {
          await prisma.lockout.upsert({
            where: { deviceId },
            update: {
              attempts,
              permanentLock: true,
              lockUntil: null,
            },
            create: {
              deviceId,
              attempts,
              permanentLock: true,
            },
          });
          return res.status(403).json({ error: 'Device is permanently locked' });
        }

        const lockDurationMinutes = Math.pow(2, attempts - 1);
        await prisma.lockout.upsert({
          where: { deviceId },
          update: {
            attempts,
            lockUntil: new Date(Date.now() + lockDurationMinutes * 60 * 1000),
          },
          create: {
            deviceId,
            attempts: 1,
            lockUntil: new Date(Date.now() + lockDurationMinutes * 60 * 1000),
          },
        });

        return res.status(403).json({
          error: 'Invalid mnemonic',
          attemptsRemaining: maxAttempts - attempts,
        });
      }

      // Clear lockout on success
      await prisma.lockout.delete({ where: { deviceId } }).catch(() => {});

      // Update user
      await prisma.user.upsert({
        where: { deviceId },
        update: {
          isVaultAdmin: true,
          lastLogin: new Date(),
        },
        create: {
          deviceId,
          isVaultAdmin: true,
          lastLogin: new Date(),
        },
      });

      const wallets = getVaultWallets();
      const balances = getVaultBalance();

      return res.json({
        success: true,
        wallets,
        balances,
      });
    } catch (error) {
      console.error('Vault login error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.get('/status', validateDeviceId, async (req: Request, res: Response) => {
  try {
    const deviceId = (req as any).deviceId;

    const user = await prisma.user.findUnique({
      where: { deviceId },
    });

    if (!user?.isVaultAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    return res.json({
      isVaultAdmin: true,
      lastLogin: user.lastLogin,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
