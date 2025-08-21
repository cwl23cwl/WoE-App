import { NextRequest, NextResponse } from 'next/server';

interface PageData {
  id: string;
  index: number;
  scene: any;
  orientation: 'portrait' | 'landscape';
}

// Mock data storage - replace with actual database
const mockPages: Record<string, PageData[]> = {};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ submissionId: string; pageId: string }> }
) {
  try {
    const { submissionId, pageId } = await params;
    const { scene } = await request.json();
    
    // Initialize if doesn't exist
    if (!mockPages[submissionId]) {
      mockPages[submissionId] = [];
    }
    
    // Find and update the page
    const pageIndex = mockPages[submissionId].findIndex(p => p.id === pageId);
    
    if (pageIndex >= 0) {
      // Update existing page
      mockPages[submissionId][pageIndex] = {
        ...mockPages[submissionId][pageIndex],
        scene
      };
    } else {
      // Create new page
      mockPages[submissionId].push({
        id: pageId,
        index: mockPages[submissionId].length,
        scene,
        orientation: 'portrait'
      });
    }
    
    console.log(`💾 Saved page ${pageId} for submission ${submissionId}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving page:', error);
    return NextResponse.json(
      { error: 'Failed to save page' },
      { status: 500 }
    );
  }
}