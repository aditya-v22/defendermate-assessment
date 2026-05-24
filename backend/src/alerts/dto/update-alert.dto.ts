import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateAlertDto {
  @ApiPropertyOptional({ enum: ['critical', 'high', 'medium', 'low', 'info'] })
  @IsOptional()
  @IsIn(['critical', 'high', 'medium', 'low', 'info'])
  severity?: string;

  @ApiPropertyOptional({ enum: ['new', 'investigating', 'resolved', 'false_positive'] })
  @IsOptional()
  @IsIn(['new', 'investigating', 'resolved', 'false_positive'])
  status?: string;

  @ApiPropertyOptional({ description: 'Analyst username or null to unassign' })
  @IsOptional()
  @IsString()
  assignee?: string | null;
}
