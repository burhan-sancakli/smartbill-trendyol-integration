import { Controller, Get, Post, Body, Patch, Param, Delete, Header, Res } from '@nestjs/common';
import express from 'express';
import { SmartbillService } from './smartbill.service';
import { SmartbillInvoiceDto } from './dto/smartbill-invoice.dto';
import { RequestSmartbillInvoiceDto } from './dto/request-smartbill-invoice.dto';

@Controller('smartbill')
export class SmartbillController {
  constructor(private readonly smartbillService: SmartbillService) {}

  @Get('tax')
  getTaxes() {
    return this.smartbillService.getTaxes();
  }

  @Get('invoice/:number')
  async getInvoice(@Param('string') seriesName: string, @Param('number') number: number, @Res() res: express.Response) {
    const pdfBuffer = await this.smartbillService.getInvoice(seriesName, number);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="invoice-${seriesName}${number}.pdf"`);
    res.send(pdfBuffer);
  }

  @Post()
  create(@Body() smartbillInvoiceDto: RequestSmartbillInvoiceDto) {
    return this.smartbillService.createInvoice(smartbillInvoiceDto);
  }
}
