import {IsNumber, IsOptional, IsString, Min} from 'class-validator';

export class ListPolicyholdersDTO {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  pageSize?: number = Number.MAX_SAFE_INTEGER;

  @IsOptional()
  @IsNumber()
  @Min(1)
  introducerId?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  parentId?: number;

  @IsOptional()
  @IsString()
  name?: string;
}
