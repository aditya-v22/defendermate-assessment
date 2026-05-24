import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AlertsService } from './alerts.service';
import { GetAlertsDto } from './dto/get-alerts.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';

@ApiTags('alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'List alerts with filtering, sorting, and pagination' })
  findAll(@Query() dto: GetAlertsDto) {
    return this.alertsService.findAll(dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get alert counts grouped by severity, status, and category' })
  getStats() {
    return this.alertsService.getStats();
  }

  @Get('timeline')
  @ApiOperation({ summary: 'Get daily alert counts over the last N days' })
  getTimeline(@Query('days') days?: string) {
    return this.alertsService.getTimeline(days ? parseInt(days, 10) : 30);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single alert by ID' })
  findOne(@Param('id') id: string) {
    return this.alertsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update alert status, severity, or assignee' })
  update(@Param('id') id: string, @Body() dto: UpdateAlertDto) {
    return this.alertsService.update(id, dto);
  }
}
