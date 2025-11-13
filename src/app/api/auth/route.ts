import { NextResponse } from "next/server";
import { verifyTokenFromCookie } from "@/lib/serverAuth";

export async function GET() {
  try {
    const user = await verifyTokenFromCookie();

    if (user) {
      return NextResponse.json({ 
        authenticated: true, 
        user: {
          id: user.id,
          email: user.email
        }
      });
    } else {
      return NextResponse.json({ 
        authenticated: false, 
        user: null 
      });
    }
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
