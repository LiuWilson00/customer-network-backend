import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import {plainToClass} from 'class-transformer';
import {validate} from 'class-validator';

export class PolicyholderPipe implements PipeTransform {
  async transform(value, metadata: ArgumentMetadata) {
    // console.log('PolicyholderPipe', value, metadata);
    const {metatype} = metadata;
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value, {
      enableImplicitConversion: true,
    });
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException('資料格式錯誤');
    }
    return value;
  }

  private toValidate(metatype): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.find((type) => metatype === type);
  }
}
