import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class CustomValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    const { startTime, endTime } = args.object as any;

    if (!startTime || !endTime) {
      return true;
    }

    const start = this.parseTime(startTime);
    const end = this.parseTime(endTime);

    if (!start || !end) {
      return false;
    }

    return start < end;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Start time must be earlier than end time';
  }

  private parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
