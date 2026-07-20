import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Secured } from '../iam/guards/permissions.guard';
import { ExportsService } from './exports.service';
import type { Response } from 'express';

@Controller('exports')
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get(':entity')
  @Secured('*.export')
  async export(
    @Param('entity') entity: string,
    @Query('format') format = 'csv',
    @Res() res: Response,
  ) {
    const dataString = await this.exportsService.exportData(entity, format);
    const contentType = format === 'json' ? 'application/json' : 'text/csv';
    const fileExtension = format === 'json' ? 'json' : 'csv';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=export-${entity}-${Date.now()}.${fileExtension}`);
    return res.send(dataString);
  }
}
