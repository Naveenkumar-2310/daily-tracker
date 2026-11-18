export interface IOcrResult {
  detectedKm?: number;
  detectedDate?: string;
  confidence: number;
  extractedRawText: string;
}

export class OcrService {
  /**
   * Analyzes recognized text from an odometer / fuel bill photo
   * Can accept either raw text passed from mobile device ML Kit or parsed from uploaded image.
   */
  public analyzeText(rawText: string): IOcrResult {
    let detectedKm: number | undefined;
    let detectedDate: string | undefined;

    // 1. Look for Odometer patterns e.g. "TRIP B 2745.9 km", "2745.9 km", "ODO 14500", "KM: 14500"
    const odoPatterns = [
      /(?:trip\s*[ab]?|odo|odometer|total)\s*[:=]?\s*(\d{1,6}(?:\.\d)?)\s*(?:km|kms)?/i,
      /(\d{1,6}\.\d)\s*(?:km|kms)?/i, // Decimal meter e.g. 2745.9 km
      /(\d{1,6})\s*(?:km|kms|kilo)/i,
      /\b(\d{3,6}(?:\.\d)?)\b/, // Fallback isolated numbers
    ];

    for (const pattern of odoPatterns) {
      const match = rawText.match(pattern);
      if (match && match[1]) {
        const val = parseFloat(match[1]);
        // Avoid mistaking current year (2025, 2026, 2027) as odometer unless accompanied by km
        const isYear = (val >= 2024 && val <= 2030) && !match[0].toLowerCase().includes('km') && !match[0].toLowerCase().includes('odo');
        if (!isNaN(val) && val > 0 && val < 999999 && !isYear) {
          detectedKm = val;
          break;
        }
      }
    }

    // 2. Look for Date patterns e.g. DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY
    const datePatterns = [
      /\b(\d{4})[-/.](\d{2})[-/.](\d{2})\b/, // YYYY-MM-DD
      /\b(\d{2})[-/.](\d{2})[-/.](\d{4})\b/, // DD-MM-YYYY
    ];

    for (const pattern of datePatterns) {
      const match = rawText.match(pattern);
      if (match) {
        if (pattern === datePatterns[0]) {
          detectedDate = `${match[1]}-${match[2]}-${match[3]}`;
        } else {
          detectedDate = `${match[3]}-${match[2]}-${match[1]}`;
        }
        break;
      }
    }

    if (!detectedDate) {
      detectedDate = new Date().toISOString().slice(0, 10);
    }

    const confidence = detectedKm ? 0.92 : 0.5;

    return {
      detectedKm,
      detectedDate,
      confidence,
      extractedRawText: rawText,
    };
  }

  /**
   * Helper to simulate or parse an uploaded image (can be connected to Google Vision / Tesseract / ML Kit)
   */
  public async analyzeImage(bufferOrBase64: string): Promise<IOcrResult> {
    // If base64 contains metadata or simulated mock text for testing
    // In production, invoke @google-cloud/vision or tesseract.js
    const sampleOdometerSim = `TRIP B 2745.9 km`;
    return this.analyzeText(sampleOdometerSim);
  }
}

