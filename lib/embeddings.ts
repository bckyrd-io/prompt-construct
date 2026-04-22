import { GoogleGenAI } from '@google/genai';

// Initialize Gemini AI client
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

/**
 * Generate embedding for a single text string
 * @param text - The text to generate embedding for
 * @returns Promise<number[]> - The embedding vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  try {
    const result = await genAI.models.embedContent({
      model: 'gemini-embedding-001',
      contents: text,
      config: { outputDimensionality: 3072 }
    });
    if (!result.embeddings || result.embeddings.length === 0) {
      throw new Error('No embeddings returned from API');
    }
    const values = result.embeddings[0].values;
    if (!values) {
      throw new Error('No embedding values returned from API');
    }
    return values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * @param texts - Array of texts to generate embeddings for
 * @returns Promise<number[][]> - Array of embedding vectors
 */
export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const embeddings: number[][] = [];
  
  // Process in batches to respect rate limits
  const batchSize = 5; // Gemini free tier allows 15 requests/minute
  const delay = 4000; // 4 seconds between batches to stay within limits

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    
    try {
      const batchEmbeddings = await Promise.all(
        batch.map(text => generateEmbedding(text))
      );
      embeddings.push(...batchEmbeddings);
    } catch (error) {
      console.error(`Error processing batch ${i / batchSize}:`, error);
      throw error;
    }

    // Add delay between batches (except for the last one)
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return embeddings;
}

/**
 * Convert embedding array to PostgreSQL vector format
 * @param embedding - The embedding array
 * @returns string - PostgreSQL vector string representation
 */
export function embeddingToPgVector(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

/**
 * Convert PostgreSQL vector string to embedding array
 * @param pgVector - The PostgreSQL vector string
 * @returns number[] - The embedding array
 */
export function pgVectorToEmbedding(pgVector: string): number[] {
  // Remove brackets and split by comma
  const clean = pgVector.replace(/[\[\]]/g, '');
  return clean.split(',').map(num => parseFloat(num));
}
