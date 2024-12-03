import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Booking } from './booking.schema';
import { Model } from 'mongoose';
import { CreateBookingDto } from './dto/create.booking.dto';
import { UpdateBookingDto } from './dto/update.booking.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
  ) {}

  async create(data: CreateBookingDto): Promise<Booking> {
    //convert string date to Date Format
    const bookingDate = new Date(data.date);

    //check if current date has no conflicts with an existing booking
    const conflict = await this.bookingModel.findOne({
      date: bookingDate,
      $or: [
        {
          startTime: { $lt: data.endTime },
          endTime: { $gt: data.startTime },
        },
      ],
    });

    if (conflict) {
      throw new ConflictException(
        `Booking conflict detected for date ${data.date} and time range ${data.startTime} - ${data.endTime}`,
      );
    }
    return await this.bookingModel.create({
      ...data,
      date: bookingDate,
    });
  }

  async findAll(): Promise<Booking[]> {
    return await this.bookingModel.find();
  }

  async findById(id: string): Promise<Booking> {
    const booking = await this.bookingModel.findById(id);
    if (!booking) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    return booking;
  }

  async update(id: string, data: UpdateBookingDto): Promise<Booking> {
    let updateData = {};

    // update date only if it exists
    if (data.date) {
      const parsedDate = new Date(data.date);
      updateData = {
        date: parsedDate,
      };
    }
    Object.assign(updateData, data);

    const updatedBooking = await this.bookingModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    if (!updatedBooking) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    return updatedBooking;
  }

  async delete(id: string): Promise<{ message: string }> {
    const result = await this.bookingModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Booking with ID "${id}" not found`);
    }

    return { message: `Booking with ID "${id}" successfully deleted` };
  }
  
}
