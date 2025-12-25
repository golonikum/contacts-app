import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, generateToken } from "@/lib/serverAuth";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Send email
    try {
      await sendEmail({
        subject: `Попытка входа в Contacts App`,
        htmlContent: `<p>Сегодня в ${new Date().toLocaleTimeString()} была совершена попытка входа в аккаунт ${email}.</p>`,
      });
    } catch (e) {}

    if (!email || !password) {
      return NextResponse.json(
        { error: "Электронная почта и пароль обязательны" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Неверные учетные данные" },
        { status: 401 }
      );
    }

    // Verify the password
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
    }

    // Generate a JWT token
    const token = generateToken(user);

    // Create response with user info (but not the token)
    const response = NextResponse.json({
      message: "Вход выполнен успешно",
      user: {
        id: user.id,
        email: user.email,
      },
    });

    // Set token in HTTP-only cookie
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
