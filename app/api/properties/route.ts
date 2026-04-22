import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { generateEmbedding, embeddingToPgVector, generateBatchEmbeddings } from '@/lib/embeddings';

// GET /api/properties - List all properties with their milestones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const location = searchParams.get('location');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    let queryString = `
      SELECT
        p.id,
        p.name,
        p.location,
        p.price,
        p.type,
        p.status,
        p.image_url,
        p.client_id,
        p.progress,
        p.beds,
        p.baths,
        p.sqft,
        p.created_at,
        u.name as client_name,
        u.email as client_email
      FROM properties p
      LEFT JOIN users u ON p.client_id = u.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Use vector similarity search if search query is provided
    if (search && search !== 'all') {
      try {
        // Check if properties need embeddings generated (lazy generation)
        const embeddingCheck = await query(
          `SELECT COUNT(*) as count
           FROM properties
           WHERE embedding IS NULL`
        );
        
        const needsEmbeddings = parseInt(embeddingCheck.rows[0].count) > 0;
        
        if (needsEmbeddings) {
          console.log('Generating embeddings for properties without them...');
          
          // Fetch properties without embeddings
          const propertiesWithoutEmbeddings = await query(
            `SELECT id, name, location, price, type, status, beds, baths, sqft, description
             FROM properties
             WHERE embedding IS NULL`
          );
          
          // Generate embeddings in batch with all relevant attributes
          const texts = propertiesWithoutEmbeddings.rows.map((p: any) => {
            const parts = [];
            if (p.beds) parts.push(`${p.beds} bedroom`);
            if (p.location) parts.push(`in ${p.location}`);
            if (p.type) parts.push(p.type);
            if (p.sqft) parts.push(`${p.sqft.toLocaleString()} sqft`);
            if (p.price) parts.push(`MK ${p.price.toLocaleString()}`);
            if (p.status) parts.push(p.status);
            const prefix = parts.join(', ');
            return `${prefix}: ${p.name}${p.description ? ' - ' + p.description : ''}`;
          });
          const embeddings = await generateBatchEmbeddings(texts);
          
          // Update each property with its embedding
          for (let i = 0; i < propertiesWithoutEmbeddings.rows.length; i++) {
            const property = propertiesWithoutEmbeddings.rows[i];
            const embedding = embeddings[i];
            
            try {
              await query(
                `UPDATE properties
                 SET embedding = $1
                 WHERE id = $2`,
                [embeddingToPgVector(embedding), property.id]
              );
            } catch (error) {
              console.error(`Error updating embedding for property ${property.id}:`, error);
            }
          }
          
          console.log(`Generated embeddings for ${propertiesWithoutEmbeddings.rows.length} properties`);
        }
        
        // Generate embedding for search query
        const searchEmbedding = await generateEmbedding(search);
        const embeddingVector = embeddingToPgVector(searchEmbedding);

        // Use pgvector cosine distance for semantic search
        queryString = `
          SELECT
            p.id,
            p.name,
            p.location,
            p.price,
            p.type,
            p.status,
            p.image_url,
            p.client_id,
            p.progress,
            p.beds,
            p.baths,
            p.sqft,
            p.created_at,
            u.name as client_name,
            u.email as client_email,
            1 - (p.embedding <=> $${paramIndex}::vector) as similarity
          FROM properties p
          LEFT JOIN users u ON p.client_id = u.id
          WHERE p.embedding IS NOT NULL
        `;
        params.push(embeddingVector);
        paramIndex++;

        // Apply additional filters
        if (location && location !== 'All Locations') {
          queryString += ` AND p.location ILIKE $${paramIndex}`;
          params.push(`%${location.split(',')[0]}%`);
          paramIndex++;
        }

        if (type && type !== 'All Types') {
          queryString += ` AND p.type = $${paramIndex}`;
          params.push(type);
          paramIndex++;
        }

        if (status && status !== 'All Status') {
          queryString += ` AND p.status = $${paramIndex}`;
          params.push(status);
          paramIndex++;
        }

        // Only return properties with meaningful similarity (threshold 0.3)
        // Reuse $1 (the embedding parameter) - it was already pushed to params above
        queryString += ` AND 1 - (p.embedding <=> $1::vector) > 0.55`;

        // Order by similarity (highest first)
        queryString += ' ORDER BY similarity DESC';

      } catch (embeddingError) {
        console.error('Embedding generation error:', embeddingError);
        return NextResponse.json(
          { 
            error: 'Failed to generate embedding for search query',
            details: embeddingError instanceof Error ? embeddingError.message : 'Unknown error',
            suggestion: 'Please ensure GEMINI_API_KEY is configured in your environment variables'
          },
          { status: 500 }
        );
      }
    } else {
      // No search query - apply traditional filters only
      if (location && location !== 'All Locations') {
        queryString += ` AND p.location ILIKE $${paramIndex}`;
        params.push(`%${location.split(',')[0]}%`);
        paramIndex++;
      }

      if (type && type !== 'All Types') {
        queryString += ` AND p.type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }

      if (status && status !== 'All Status') {
        queryString += ` AND p.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      queryString += ' ORDER BY p.created_at DESC';
    }

    const result = await query(queryString, params);

    // Get milestones for each property
    const propertiesWithMilestones = await Promise.all(
      result.rows.map(async (property: {
        id: string;
        name: string;
        location: string;
        price: number;
        type: string;
        status: string;
        image_url?: string;
        client_id?: string;
        progress: number;
        beds?: number;
        baths?: number;
        sqft?: number;
        created_at: Date;
        client_name?: string;
        client_email?: string;
      }) => {
        const milestonesResult = await query(
          `SELECT id, name, completed, current, payment_status, amount, due_date, photos, ai_note
           FROM property_milestones
           WHERE property_id = $1
           ORDER BY display_order`,
          [property.id]
        );

        return {
          ...property,
          client: property.client_id ? {
            id: property.client_id,
            name: property.client_name,
            email: property.client_email
          } : null,
          milestones: milestonesResult.rows.map((m: any) => ({
            ...m,
            photos: m.photos || []
          }))
        };
      })
    );

    return NextResponse.json({ properties: propertiesWithMilestones });
  } catch (error) {
    console.error('Get properties error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/properties - Create new property with milestones
export async function POST(request: NextRequest) {
  const client = await getClient();
  
  try {
    const { name, location, price, type, status, beds, baths, sqft, description, image_url } = await request.json();

    if (!name || !location || !price || !type) {
      return NextResponse.json(
        { error: 'Name, location, price, and type are required' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    // Insert property
    const propertyResult = await client.query(
      `INSERT INTO properties (name, location, price, type, status, image_url, progress, beds, baths, sqft, description)
       VALUES ($1, $2, $3, $4, $5, $6, 0, $7, $8, $9, $10)
       RETURNING *`,
      [name, location, price, type, status || 'available', image_url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400', beds || 0, baths || 0, sqft || 0, description || null]
    );

    const property = propertyResult.rows[0];

    // Create a single empty milestone for the property
    const milestoneResult = await client.query(
      `INSERT INTO property_milestones (property_id, name, display_order, completed, current, payment_status, amount)
       VALUES ($1, '', 1, false, false, 'unpaid', 0)
       RETURNING id, name, display_order, completed, current, payment_status, amount`,
      [property.id]
    );

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      property: {
        ...property,
        milestones: [{
          ...milestoneResult.rows[0],
          photos: []
        }]
      }
    }, { status: 201 });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create property error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
