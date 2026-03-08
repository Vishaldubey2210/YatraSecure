import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { JoinTripDto } from './dto/join-trip.dto';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import * as crypto from 'crypto';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  private generateInviteCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  // ================= CREATE TRIP =================
  async createTrip(userId: string, dto: CreateTripDto) {
    const { startDate, endDate, budget, isPublic = true, ...rest } = dto;
    const inviteCode = !isPublic ? this.generateInviteCode() : null;

    const trip = await this.prisma.trip.create({
      data: {
        ...rest,
        budget,
        isPublic,
        inviteCode,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        adminId: userId,
      },
      include: {
        admin: {
          select: { id: true, username: true, city: true, state: true, profileImage: true },
        },
      },
    });

    await this.prisma.tripMember.create({
      data: { tripId: trip.id, userId, role: 'admin' },
    });

    await this.prisma.wallet.create({
      data: { tripId: trip.id, totalBudget: budget },
    });

    return trip;
  }

  // ================= UPDATE TRIP =================
  async updateTrip(id: string, updateTripDto: any, userId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id } });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.adminId !== userId) throw new ForbiddenException('Only trip admin can update');

    const data: any = { ...updateTripDto };
    if (updateTripDto.startDate) data.startDate = new Date(updateTripDto.startDate);
    if (updateTripDto.endDate)   data.endDate   = new Date(updateTripDto.endDate);

    if (updateTripDto.isPublic === false && !trip.inviteCode) {
      data.inviteCode = this.generateInviteCode();
    }
    if (updateTripDto.isPublic === true) {
      data.inviteCode = null;
    }

    return this.prisma.trip.update({
      where: { id },
      data,
      include: {
        admin: {
          select: { id: true, username: true, city: true, state: true, profileImage: true },
        },
      },
    });
  }

  // ================= DELETE TRIP =================
  async deleteTrip(id: string, userId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: { members: true },
    });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.adminId !== userId) throw new ForbiddenException('Only trip admin can delete');

    await this.prisma.$transaction([
      this.prisma.joinRequest.deleteMany({ where: { tripId: id } }),
      this.prisma.tripMember.deleteMany({ where: { tripId: id } }),
      this.prisma.transaction.deleteMany({ where: { wallet: { tripId: id } } }),
      this.prisma.expenseParticipant.deleteMany({
        where: { expense: { wallet: { tripId: id } } },
      }),
      this.prisma.expense.deleteMany({ where: { wallet: { tripId: id } } }),
      this.prisma.wallet.deleteMany({ where: { tripId: id } }),
      this.prisma.trip.delete({ where: { id } }),
    ]);

    return { message: 'Trip deleted successfully' };
  }

  // ================= LIST TRIPS =================
  async findAll(query: any, requestingUserId?: string) {
    const {
      search, fromCity, toCity,
      minBudget, maxBudget,
      tripType, startDate,
      page = 1, limit = 12,
      sortBy = 'createdAt', sortOrder = 'desc',
      myTrips = false,
    } = query;

    let where: any;

    if (myTrips && requestingUserId) {
      where = {
        OR: [
          { adminId: requestingUserId },
          { members: { some: { userId: requestingUserId } } },
        ],
      };
    } else {
      where = { isPublic: true };
    }

    if (search) {
      const searchCondition = [
        { name:     { contains: search, mode: 'insensitive' as const } },
        { fromCity: { contains: search, mode: 'insensitive' as const } },
        { toCity:   { contains: search, mode: 'insensitive' as const } },
      ];
      if (where.OR) {
        where = {
          AND: [
            { OR: where.OR },
            { OR: searchCondition },
          ],
        };
      } else {
        where.OR = searchCondition;
      }
    }

    if (fromCity) where.fromCity = { contains: fromCity, mode: 'insensitive' };
    if (toCity)   where.toCity   = { contains: toCity,   mode: 'insensitive' };

    if (minBudget || maxBudget) {
      where.budget = {};
      if (minBudget) where.budget.gte = parseFloat(minBudget);
      if (maxBudget) where.budget.lte = parseFloat(maxBudget);
    }

    if (tripType)  where.tripType  = { equals: tripType, mode: 'insensitive' };
    if (startDate) where.startDate = { gte: new Date(startDate) };

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const take  = parseInt(limit);
    const total = await this.prisma.trip.count({ where });

    const orderBy: any =
      sortBy === 'budget'    ? { budget: sortOrder }    :
      sortBy === 'startDate' ? { startDate: sortOrder } :
                               { createdAt: sortOrder };

    const trips = await this.prisma.trip.findMany({
      where,
      include: {
        admin:   { select: { id: true, username: true, city: true, state: true, profileImage: true } },
        members: { select: { userId: true, role: true } },
        _count:  { select: { members: true } },
      },
      orderBy,
      skip,
      take,
    });

    const sanitized = trips.map(({ inviteCode, ...t }: any) => t);

    return {
      trips: sanitized,
      pagination: {
        total,
        page:       parseInt(page),
        limit:      parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
        hasMore:    skip + take < total,
      },
    };
  }

  // ================= GET TRIP BY ID =================
  async getTripById(id: string, requestingUserId?: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        admin: {
          select: { id: true, username: true, city: true, state: true, profileImage: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, username: true, city: true, state: true, profileImage: true },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });

    if (!trip) throw new NotFoundException('Trip not found');

    const isMemberOrAdmin =
      requestingUserId &&
      (trip.adminId === requestingUserId ||
        trip.members.some((m) => m.userId === requestingUserId));

    if (!isMemberOrAdmin) {
      const { inviteCode, ...rest } = trip as any;
      return rest;
    }

    return trip;
  }

  // ================= JOIN BY INVITE CODE =================
  async joinByInviteCode(code: string, userId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { inviteCode: code.toUpperCase().trim() },
    });
    if (!trip) throw new NotFoundException('Invalid invite code');

    const existing = await this.prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId: trip.id, userId } },
    });
    if (existing) throw new BadRequestException('Already a member of this trip');

    await this.prisma.tripMember.create({
      data: { tripId: trip.id, userId, role: 'member' },
    });

    return { message: 'Joined trip successfully', tripId: trip.id };
  }

  // ================= REGENERATE INVITE CODE =================
  async regenerateInviteCode(tripId: string, userId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip)                   throw new NotFoundException('Trip not found');
    if (trip.adminId !== userId) throw new ForbiddenException('Only admin can regenerate code');
    if (trip.isPublic)           throw new BadRequestException('Public trips do not have invite codes');

    const newCode = this.generateInviteCode();
    const updated = await this.prisma.trip.update({
      where: { id: tripId },
      data:  { inviteCode: newCode },
    });

    return { inviteCode: updated.inviteCode };
  }

  // ================= REQUEST TO JOIN (Public trips) =================
  async requestToJoinTrip(tripId: string, userId: string, dto: JoinTripDto) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip)          throw new NotFoundException('Trip not found');
    if (!trip.isPublic) throw new ForbiddenException('Private trip — use invite code to join');

    const existingMember = await this.prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
    if (existingMember) throw new ForbiddenException('Already a member of this trip');

    const existingRequest = await this.prisma.joinRequest.findFirst({
      where: { tripId, requesterId: userId, status: 'pending' },
    });
    if (existingRequest) throw new ForbiddenException('Join request already pending');

    return this.prisma.joinRequest.create({
      data: { tripId, requesterId: userId, message: dto.message },
    });
  }

  // ================= LIST JOIN REQUESTS (Admin) =================
  async listJoinRequests(tripId: string, adminId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip)                    throw new NotFoundException('Trip not found');
    if (trip.adminId !== adminId) throw new ForbiddenException('Only admin can view requests');

    return this.prisma.joinRequest.findMany({
      where:   { tripId },
      include: {
        requester: {
          select: { id: true, username: true, city: true, state: true, profileImage: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ================= UPDATE JOIN REQUEST (Admin) =================
  async updateJoinRequest(
    tripId: string,
    requestId: string,
    adminId: string,
    dto: UpdateRequestStatusDto,
  ) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip)                    throw new NotFoundException('Trip not found');
    if (trip.adminId !== adminId) throw new ForbiddenException('Only admin can manage requests');

    const joinRequest = await this.prisma.joinRequest.findUnique({ where: { id: requestId } });
    if (!joinRequest) throw new NotFoundException('Join request not found');

    const updated = await this.prisma.joinRequest.update({
      where: { id: requestId },
      data:  { status: dto.status },
    });

    if (dto.status === 'accepted') {
      const already = await this.prisma.tripMember.findUnique({
        where: { tripId_userId: { tripId, userId: joinRequest.requesterId } },
      });
      if (!already) {
        await this.prisma.tripMember.create({
          data: { tripId, userId: joinRequest.requesterId, role: 'member' },
        });
      }
    }

    return updated;
  }

  // ================= LIST MEMBERS =================
  async listMembers(tripId: string) {
    return this.prisma.tripMember.findMany({
      where:   { tripId },
      include: {
        user: {
          select: { id: true, username: true, city: true, state: true, profileImage: true },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  // ================= FIND BY ID (internal) =================
  async findById(tripId: string) {
    return this.prisma.trip.findUnique({
      where: { id: tripId },
    });
  }

  // ================= UPDATE ITINERARY =================
  async updateItinerary(tripId: string, itinerary: string) {
    return this.prisma.trip.update({
      where: { id: tripId },
      data:  { itinerary },
    });
  }
}
