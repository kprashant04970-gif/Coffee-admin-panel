import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Operator session terminated',
  });

  response.cookies.set('session_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  response.cookies.set('mc_operator_role', '', {
    httpOnly: false,
    expires: new Date(0),
    path: '/',
  });

  return response;
}
