import { IsNotEmpty, IsNumber } from 'class-validator';

export class DemoteDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
