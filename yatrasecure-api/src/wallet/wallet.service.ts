import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  // Get wallet for a trip (only members)
  async getWallet(tripId: string, userId: string) {
    const member = await this.prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
    if (!member) throw new ForbiddenException('Not a member of this trip');

    const wallet = await this.prisma.wallet.findUnique({
      where: { tripId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!wallet) throw new NotFoundException('Wallet not found');

    return wallet;
  }

  // Add contribution (no Stripe yet, just fake for now)
  async addContribution(tripId: string, userId: string, amount: number, description?: string) {
    const member = await this.prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
    if (!member) throw new ForbiddenException('Not a member of this trip');

    const wallet = await this.prisma.wallet.findUnique({ where: { tripId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const tx = await this.prisma.transaction.create({
      data: {
        walletId: wallet.id,
        userId,
        type: 'contribution',
        amount,
        description: description ?? 'Manual contribution',
      },
    });

    await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        collected: wallet.collected + amount,
      },
    });

    return tx;
  }
}
