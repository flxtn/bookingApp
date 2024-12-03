import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Booking extends Document {
  @Prop({ required: true })
  user: string;

  @Prop({
    required: true,
  })
  date: Date;

  @Prop({
    required: true,
  })
  startTime: string;

  @Prop({
    required: true,
  })
  endTime: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
