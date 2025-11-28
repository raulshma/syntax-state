import { NextRequest, NextResponse } from 'next/server';
import { exportInterviewPDF } from '@/lib/actions/interview';

/**
 * POST /api/interview/[id]/export/pdf
 * 
 * Export an interview as a PDF file
 * Requirements: 2.5
 * 
 * Query parameters:
 * - includeOpeningBrief: boolean (default: true)
 * - includeTopics: boolean (default: true)
 * - includeMCQs: boolean (default: true)
 * - includeRapidFire: boolean (default: true)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: interviewId } = await params;

    // Parse query parameters for export options
    const searchParams = request.nextUrl.searchParams;
    const options = {
      includeOpeningBrief: searchParams.get('includeOpeningBrief') !== 'false',
      includeTopics: searchParams.get('includeTopics') !== 'false',
      includeMCQs: searchParams.get('includeMCQs') !== 'false',
      includeRapidFire: searchParams.get('includeRapidFire') !== 'false',
    };

    // Call the server action to generate PDF
    const result = await exportInterviewPDF(interviewId, options);

    if (!result.success) {
      // Return appropriate error status based on error code
      const statusCode =
        result.error.code === 'NOT_FOUND'
          ? 404
          : result.error.code === 'AUTH_ERROR'
            ? 403
            : result.error.code === 'PLAN_REQUIRED'
              ? 403
              : 400;

      return NextResponse.json(
        { error: result.error.message, code: result.error.code },
        { status: statusCode }
      );
    }

    // Return PDF as downloadable file
    const { buffer, filename } = result.data;

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('PDF export API error:', error);
    return NextResponse.json(
      { error: 'Failed to export PDF' },
      { status: 500 }
    );
  }
}
