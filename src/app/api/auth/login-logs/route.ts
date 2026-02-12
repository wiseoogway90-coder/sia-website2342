import { NextRequest, NextResponse } from 'next/server';
import { getAllLoginLogs } from '@/lib/loginLogsDatabase';

interface LogsResponse {
  success: boolean;
  message?: string;
  logs?: any[];
}

export async function GET(request: NextRequest): Promise<NextResponse<LogsResponse>> {
  try {
    // Get token from header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get logs - in a real app, you'd verify the token and check if user is admin
    // For now, we'll just return the logs (should add role check in production)
    const logs = getAllLoginLogs();

    return NextResponse.json(
      {
        success: true,
        logs,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get logs error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
