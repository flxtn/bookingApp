import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BookingService } from './booking.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Booking } from './booking.schema';
import { CreateBookingDto } from './dto/create.booking.dto';
import { UpdateBookingDto } from './dto/update.booking.dto';

describe('BookingService', () => {
  let service: BookingService;
  let bookingModel: Model<Booking>;

  const mockBookingModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: getModelToken(Booking.name),
          useValue: mockBookingModel,
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    bookingModel = module.get<Model<Booking>>(getModelToken(Booking.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new booking successfully', async () => {
      const createBookingDto: CreateBookingDto = {
        user: 'key M',
        date: '2024-12-01',
        startTime: '10:00',
        endTime: '11:00',
        timeSlotValidation: true,
      };

      const mockCreatedBooking = { ...createBookingDto, _id: '12345' };

      mockBookingModel.findOne.mockResolvedValue(null);
      mockBookingModel.create.mockResolvedValue(mockCreatedBooking);
      mockBookingModel.save.mockResolvedValue(mockCreatedBooking);

      const result = await service.create(createBookingDto);

      expect(mockBookingModel.findOne).toHaveBeenCalledWith({
        date: new Date('2024-12-01'),
        $or: [{ startTime: { $lt: '11:00' }, endTime: { $gt: '10:00' } }],
      });
      expect(mockBookingModel.create).toHaveBeenCalledWith({
        ...createBookingDto,
        date: new Date('2024-12-01'),
      });
      expect(result).toEqual(mockCreatedBooking);
    });

    it('should throw ConflictException if booking time overlaps', async () => {
      const createBookingDto: CreateBookingDto = {
        user: 'key M',
        date: '2024-12-01',
        startTime: '10:00',
        endTime: '11:00',
        timeSlotValidation: true,
      };

      const mockConflictBooking = {
        user: 'key M',
        date: new Date('2024-12-01'),
        startTime: '09:00',
        endTime: '10:30',
      };

      mockBookingModel.findOne.mockResolvedValue(mockConflictBooking);

      await expect(service.create(createBookingDto)).rejects.toThrow(
        new ConflictException(
          `Booking conflict detected for date 2024-12-01 and time range 10:00 - 11:00`,
        ),
      );
    });
  });

  describe('findAll', () => {
    it('should return all bookings', async () => {
      const mockBookings = [
        {
          user: 'key M',
          date: new Date('2024-12-01'),
          startTime: '10:00',
          endTime: '11:00',
          _id: '123',
        },
        {
          user: 'key M',
          date: new Date('2024-12-02'),
          startTime: '12:00',
          endTime: '13:00',
          _id: '124',
        },
      ];

      mockBookingModel.find.mockResolvedValue(mockBookings);

      const result = await service.findAll();

      expect(mockBookingModel.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockBookings);
    });

    it('should return an empty array if no bookings found', async () => {
      mockBookingModel.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(mockBookingModel.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a booking when found', async () => {
      const mockBooking = {
        user: 'key M',
        date: new Date('2024-12-01'),
        startTime: '10:00',
        endTime: '11:00',
        _id: '12345',
      };

      mockBookingModel.findById.mockResolvedValue(mockBooking);

      const result = await service.findById('12345');

      expect(mockBookingModel.findById).toHaveBeenCalledWith('12345');
      expect(result).toEqual(mockBooking);
    });

    it('should throw an error if booking not found', async () => {
      mockBookingModel.findById.mockResolvedValue(null);

      await expect(service.findById('12345')).rejects.toThrowError(
        'Booking with ID 12345 not found',
      );
    });
  });

  describe('delete', () => {
    it('should delete a booking successfully', async () => {
      const mockDeletedBooking = {
        user: 'key M',
        date: new Date('2024-12-01'),
        startTime: '10:00',
        endTime: '11:00',
        _id: '12345',
      };

      mockBookingModel.findByIdAndDelete.mockResolvedValue(mockDeletedBooking);

      const result = await service.delete('12345');

      expect(mockBookingModel.findByIdAndDelete).toHaveBeenCalledWith('12345');
      expect(result).toEqual({
        message: 'Booking with ID "12345" successfully deleted',
      });
    });

    it('should throw NotFoundException if booking not found', async () => {
      mockBookingModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(service.delete('12345')).rejects.toThrowError(
        new NotFoundException('Booking with ID "12345" not found'),
      );
    });
  });

  describe('update', () => {
    it('should update a booking successfully', async () => {
      const mockBooking = {
        user: 'User1',
        date: new Date('2024-12-01'),
        startTime: '10:00',
        endTime: '11:00',
        _id: '12345',
      };

      const updatedBookingData = {
        user: 'UpdatedUser',
        date: '2024-12-02',
        startTime: '12:00',
        endTime: '13:00',
        timeSlotValidation: true, 
      };

      const parsedDate = new Date(updatedBookingData.date);
    const updatedBooking = {
      ...mockBooking,
      ...updatedBookingData,
      date: parsedDate,  
    };

    mockBookingModel.findByIdAndUpdate.mockResolvedValue(updatedBooking);

    const result = await service.update('12345', updatedBookingData);

    // Для отладки
    console.log('Expected date:', new Date(updatedBooking.date));
    console.log('Received date:', result.date);

    expect(mockBookingModel.findByIdAndUpdate).toHaveBeenCalledWith(
      '12345',
      { 
        ...updatedBookingData,
      },
      { new: true }
    );

      expect(result).toEqual(updatedBooking);
    });

    it('should throw an error if booking not found', async () => {
      const updatedBookingData = {
        user: 'UpdatedUser',
        date: '2024-12-02',
        startTime: '12:00',
        endTime: '13:00',
        timeSlotValidation: true,
      };

      mockBookingModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(
        service.update('12345', updatedBookingData),
      ).rejects.toThrowError(new Error('Booking with ID 12345 not found'));
    });
  });
});
