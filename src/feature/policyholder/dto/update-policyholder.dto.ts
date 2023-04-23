import {IsNotEmpty, IsOptional, IsNumber} from 'class-validator';

export class UpdatePolicyholderDTO {
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsNumber()
  introducerId?: number;

  @IsOptional()
  @IsNumber()
  parentId?: number;

  @IsOptional()
  @IsNumber()
  leftChildId?: number;

  @IsOptional()
  @IsNumber()
  rightChildId?: number;
}
