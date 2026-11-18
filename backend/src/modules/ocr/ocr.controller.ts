import { Request, Response, NextFunction } from 'express';
import { OcrService } from './ocr.service';

export class OcrController {
  constructor(private ocrService: OcrService = new OcrService()) {}

  public analyzeText = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        res.status(400).json({ success: false, message: 'Text string is required for analysis' });
        return;
      }

      const result = this.ocrService.analyzeText(text);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public analyzeImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { imageBase64 } = req.body;
      const result = await this.ocrService.analyzeImage(imageBase64 || '');
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}

