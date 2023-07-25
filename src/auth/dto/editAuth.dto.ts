import { IsOptional, IsString } from 'class-validator';

export class EditAuthDto {
  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  username?: string;
}
