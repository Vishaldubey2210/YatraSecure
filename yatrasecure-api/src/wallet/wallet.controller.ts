import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class ContributionDto {
  amount: number;
  description?: string;
}

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  // GET /api/wallets/:tripId
  @Get(':tripId')
  async getWallet(@Request() req, @Param('tripId') tripId: string) {
    return this.walletService.getWallet(tripId, req.user.id);
  }

  // POST /api/wallets/:tripId/transactions
  @Post(':tripId/transactions')
  async addContribution(
    @Request() req,
    @Param('tripId') tripId: string,
    @Body() body: ContributionDto,
  ) {
    return this.walletService.addContribution(tripId, req.user.id, body.amount, body.description);
  }
}
