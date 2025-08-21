import { NextRequest, NextResponse } from 'next/server';

interface PageData {
  id: string;
  index: number;
  scene: any;
  orientation: 'portrait' | 'landscape';
}

// Mock data for now - replace with actual database calls
const mockPages: Record<string, PageData[]> = {};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const { submissionId } = await params;
    
    // Get or create mock pages for this submission
    if (!mockPages[submissionId]) {
      mockPages[submissionId] = [
        {
          id: `${submissionId}-page-1`,
          index: 0,
          scene: { elements: [], appState: {} },
          orientation: 'portrait'
        }
      ];
    }
    
    return NextResponse.json(mockPages[submissionId]);
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}