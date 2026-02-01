import { IsString, IsArray, IsDateString, IsOptional, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCauserieDto {
  @ApiProperty({ example: 'SENSIBILISATION TRI DES DÉCHETS' })
  @IsString()
  @MinLength(5)
  CS_Theme!: string;

  @ApiProperty({ example: '2026-02-01' })
  @IsDateString()
  CS_Date!: string;

  @ApiProperty({ example: 'Discussion sur les nouveaux bacs de recyclage au site A' })
  @IsString()
  @IsOptional()
  CS_CompteRendu?: string;

  @ApiProperty({ example: ['uuid-user-1', 'uuid-user-2'] })
  @IsArray()
  @IsUUID('all', { each: true })
  participantIds!: string[];
}