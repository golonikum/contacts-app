export const sendEmail = async ({
  subject,
  htmlContent,
}: {
  subject: string;
  htmlContent: string;
}): Promise<Response> => {
  return await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || "Acme <onboarding@resend.dev>",
      to: [process.env.ADMIN_EMAIL],
      subject,
      html: htmlContent,
    }),
  });
};
