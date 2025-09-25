import { NextResponse } from 'next/server';
import { getContents, type ContentItem } from '@/app/actions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  
  try {
    const result = await getContents();
    
    if (!result.success || !result.data) {
      return NextResponse.json({ success: false, message: 'Failed to fetch content' }, { status: 400 });
    }
    

    // Filter by category if provided
    const filteredData = category 
      ? result.data.filter((item: ContentItem) => 
          item.category?.toLowerCase() === category.toLowerCase()
        )
      : result.data;
    
    return NextResponse.json({ 
      success: true, 
      data: filteredData 
    });
    
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
