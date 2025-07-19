import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Commission, CommissionDocument, CommissionType, CommissionStatus } from '../schemas/commission.schema';
import { CreateCommissionDto } from '../dto/create-commission.dto';
import { UpdateCommissionDto } from '../dto/update-commission.dto';

@Injectable()
export class CommissionsService {
  constructor(
    @InjectModel(Commission.name) private commissionModel: Model<CommissionDocument>
  ) {}

  async create(createCommissionDto: CreateCommissionDto): Promise<CommissionDocument> {
    const { commissionType, commissionRate, rideAmount } = createCommissionDto;
    
    // Calcul automatique de la commission
    let commissionAmount: number;
    if (commissionType === CommissionType.PERCENTAGE) {
      commissionAmount = (rideAmount * commissionRate) / 100;
    } else {
      commissionAmount = commissionRate;
    }

    const driverEarnings = rideAmount - commissionAmount;

    const commission = new this.commissionModel({
      ...createCommissionDto,
      commissionAmount,
      driverEarnings,
      status: CommissionStatus.CALCULATED,
    });

    return commission.save();
  }

  async findAll(): Promise<CommissionDocument[]> {
    return this.commissionModel
      .find()
      .populate('rideId')
      .populate('driverId', 'firstname lastname email')
      .populate('businessId', 'name')
      .exec();
  }

  async findOne(id: string): Promise<CommissionDocument> {
    const commission = await this.commissionModel
      .findById(id)
      .populate('rideId')
      .populate('driverId', 'firstname lastname email')
      .populate('businessId', 'name')
      .exec();

    if (!commission) {
      throw new NotFoundException(`Commission avec l'ID ${id} non trouvée`);
    }

    return commission;
  }

  async findByDriver(driverId: string): Promise<CommissionDocument[]> {
    return this.commissionModel
      .find({ driverId })
      .populate('rideId')
      .populate('businessId', 'name')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByBusiness(businessId: string): Promise<CommissionDocument[]> {
    return this.commissionModel
      .find({ businessId })
      .populate('rideId')
      .populate('driverId', 'firstname lastname email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, updateCommissionDto: UpdateCommissionDto): Promise<CommissionDocument> {
    const commission = await this.commissionModel
      .findByIdAndUpdate(id, updateCommissionDto, { new: true })
      .populate('rideId')
      .populate('driverId', 'firstname lastname email')
      .populate('businessId', 'name')
      .exec();

    if (!commission) {
      throw new NotFoundException(`Commission avec l'ID ${id} non trouvée`);
    }

    return commission;
  }

  async markAsPaid(id: string): Promise<CommissionDocument> {
    const commission = await this.commissionModel
      .findByIdAndUpdate(
        id,
        { 
          status: CommissionStatus.PAID,
          paidAt: new Date()
        },
        { new: true }
      )
      .populate('rideId')
      .populate('driverId', 'firstname lastname email')
      .populate('businessId', 'name')
      .exec();

    if (!commission) {
      throw new NotFoundException(`Commission avec l'ID ${id} non trouvée`);
    }

    return commission;
  }

  async getCommissionStats(driverId?: string, businessId?: string) {
    const matchFilter: any = {};
    if (driverId) matchFilter.driverId = driverId;
    if (businessId) matchFilter.businessId = businessId;

    const stats = await this.commissionModel.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$commissionAmount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalCommissions = await this.commissionModel.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$commissionAmount' },
          totalRides: { $sum: 1 },
          totalDriverEarnings: { $sum: '$driverEarnings' },
        },
      },
    ]);

    return {
      byStatus: stats,
      totals: totalCommissions[0] || {
        totalAmount: 0,
        totalRides: 0,
        totalDriverEarnings: 0,
      },
    };
  }

  async remove(id: string): Promise<void> {
    const result = await this.commissionModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Commission avec l'ID ${id} non trouvée`);
    }
  }
}
