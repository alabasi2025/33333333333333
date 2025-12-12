import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class PdfGeneratorService {
  async generateIncomeStatementPdf(data: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('Income Statement', { align: 'center' });
      doc.fontSize(12).text(`قائمة الدخل`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Period: ${data.period.startDate} to ${data.period.endDate}`, { align: 'center' });
      doc.moveDown(2);

      // Revenue Section
      doc.fontSize(14).text('Revenue - الإيرادات', { underline: true });
      doc.moveDown(0.5);
      
      let y = doc.y;
      data.revenue.items.forEach((item: any) => {
        doc.fontSize(10)
           .text(`${item.accountCode} - ${item.accountName}`, 50, y, { width: 350 })
           .text(item.amount.toFixed(2), 400, y, { width: 150, align: 'right' });
        y += 20;
      });
      
      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 10;
      doc.fontSize(12)
         .text('Total Revenue', 50, y, { width: 350 })
         .text(data.revenue.total.toFixed(2), 400, y, { width: 150, align: 'right' });
      
      doc.moveDown(2);

      // Expenses Section
      y = doc.y;
      doc.fontSize(14).text('Expenses - المصروفات', { underline: true });
      doc.moveDown(0.5);
      
      y = doc.y;
      data.expenses.items.forEach((item: any) => {
        doc.fontSize(10)
           .text(`${item.accountCode} - ${item.accountName}`, 50, y, { width: 350 })
           .text(item.amount.toFixed(2), 400, y, { width: 150, align: 'right' });
        y += 20;
      });
      
      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 10;
      doc.fontSize(12)
         .text('Total Expenses', 50, y, { width: 350 })
         .text(data.expenses.total.toFixed(2), 400, y, { width: 150, align: 'right' });
      
      doc.moveDown(3);

      // Net Income
      y = doc.y;
      doc.moveTo(50, y).lineTo(550, y).stroke();
      doc.moveTo(50, y + 30).lineTo(550, y + 30).stroke();
      y += 10;
      doc.fontSize(14)
         .text('Net Income - صافي الدخل', 50, y, { width: 350 })
         .text(data.netIncome.toFixed(2), 400, y, { width: 150, align: 'right' });

      // Footer
      doc.fontSize(8).text(`Generated on ${new Date().toISOString()}`, 50, 750, { align: 'center' });

      doc.end();
    });
  }

  async generateBalanceSheetPdf(data: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('Balance Sheet', { align: 'center' });
      doc.fontSize(12).text(`الميزانية العمومية`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`As of: ${data.asOfDate}`, { align: 'center' });
      doc.moveDown(2);

      // Assets Section
      doc.fontSize(14).text('Assets - الأصول', { underline: true });
      doc.moveDown(0.5);
      
      let y = doc.y;
      data.assets.items.forEach((item: any) => {
        doc.fontSize(10)
           .text(`${item.accountCode} - ${item.accountName}`, 50, y, { width: 350 })
           .text(item.amount.toFixed(2), 400, y, { width: 150, align: 'right' });
        y += 20;
      });
      
      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 10;
      doc.fontSize(12)
         .text('Total Assets', 50, y, { width: 350 })
         .text(data.assets.total.toFixed(2), 400, y, { width: 150, align: 'right' });
      
      doc.moveDown(2);

      // Liabilities Section
      y = doc.y;
      doc.fontSize(14).text('Liabilities - الخصوم', { underline: true });
      doc.moveDown(0.5);
      
      y = doc.y;
      data.liabilities.items.forEach((item: any) => {
        doc.fontSize(10)
           .text(`${item.accountCode} - ${item.accountName}`, 50, y, { width: 350 })
           .text(item.amount.toFixed(2), 400, y, { width: 150, align: 'right' });
        y += 20;
      });
      
      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 10;
      doc.fontSize(12)
         .text('Total Liabilities', 50, y, { width: 350 })
         .text(data.liabilities.total.toFixed(2), 400, y, { width: 150, align: 'right' });
      
      doc.moveDown(2);

      // Equity Section
      y = doc.y;
      doc.fontSize(14).text('Equity - حقوق الملكية', { underline: true });
      doc.moveDown(0.5);
      
      y = doc.y;
      data.equity.items.forEach((item: any) => {
        doc.fontSize(10)
           .text(`${item.accountCode} - ${item.accountName}`, 50, y, { width: 350 })
           .text(item.amount.toFixed(2), 400, y, { width: 150, align: 'right' });
        y += 20;
      });
      
      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 10;
      doc.fontSize(12)
         .text('Total Equity', 50, y, { width: 350 })
         .text(data.equity.total.toFixed(2), 400, y, { width: 150, align: 'right' });

      // Footer
      doc.fontSize(8).text(`Generated on ${new Date().toISOString()}`, 50, 750, { align: 'center' });

      doc.end();
    });
  }

  async generateCashFlowPdf(data: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('Cash Flow Statement', { align: 'center' });
      doc.fontSize(12).text(`قائمة التدفقات النقدية`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Period: ${data.period.startDate} to ${data.period.endDate}`, { align: 'center' });
      doc.moveDown(2);

      // Opening Balance
      doc.fontSize(12).text(`Opening Balance: ${data.openingBalance.toFixed(2)}`);
      doc.moveDown();

      // Cash Flow Items
      doc.fontSize(14).text('Cash Flow Items', { underline: true });
      doc.moveDown(0.5);
      
      let y = doc.y;
      data.cashFlowItems.forEach((item: any) => {
        doc.fontSize(9)
           .text(item.date, 50, y, { width: 80 })
           .text(item.description, 135, y, { width: 200 })
           .text(item.amount.toFixed(2), 400, y, { width: 150, align: 'right' });
        y += 18;
      });
      
      doc.moveDown();
      y = doc.y;
      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 10;
      doc.fontSize(12)
         .text('Total Cash Flow', 50, y, { width: 350 })
         .text(data.totalCashFlow.toFixed(2), 400, y, { width: 150, align: 'right' });
      
      doc.moveDown(2);
      y = doc.y;
      doc.moveTo(50, y).lineTo(550, y).stroke();
      doc.moveTo(50, y + 30).lineTo(550, y + 30).stroke();
      y += 10;
      doc.fontSize(14)
         .text('Closing Balance', 50, y, { width: 350 })
         .text(data.closingBalance.toFixed(2), 400, y, { width: 150, align: 'right' });

      // Footer
      doc.fontSize(8).text(`Generated on ${new Date().toISOString()}`, 50, 750, { align: 'center' });

      doc.end();
    });
  }
}
