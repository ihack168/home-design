import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    posts: [],
    pagination: {
      total: 0,
      currentPage: 1,
      totalPages: 0
    },
    message: 'This site is an independent product site. External Blogger posts are not loaded.'
  });
}