import { IsNotEmpty, IsNumber } from 'class-validator';

export class PromoteDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
