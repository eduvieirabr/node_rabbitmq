import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsPositive, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @IsPositive()
  price!: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @IsEmail()
  customerEmail!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @IsNumber()
  @IsPositive()
  total!: number;
}

