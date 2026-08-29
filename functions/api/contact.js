export async function onRequestPost(context) {
    try {

        const formData = await context.request.formData();

        const turnstileToken = formData.get("cf-turnstile-response");

        if (!turnstileToken) {
            return new Response(
                "Please complete the verification and try again.",
                { status: 400 }
            );
        }

        const turnstileResponse = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    secret: context.env.TURNSTILE_SECRET_KEY,
                    response: turnstileToken
                })
            }
        );

        const turnstileResult = await turnstileResponse.json();

        if (!turnstileResult.success) {
            return new Response(
                "Verification failed. Please go back and try again.",
                { status: 400 }
            );
        }

        const name = formData.get("name")?.toString().trim();
        const email = formData.get("email")?.toString().trim();
        const message = formData.get("message")?.toString().trim();

        if (!name || !email || !message) {
            return new Response(
                "Please complete all required fields.",
                { status: 400 }
            );
        }

        await context.env.EMAIL_WORKER.fetch(
            "https://camp-mikey-email.internal",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    type: "contact",
                    name,
                    email,
                    message
                })
            }
        );

        return Response.redirect(
            new URL("/thanks.html", context.request.url).toString(),
            303
        );

    } catch (error) {

        console.error("Contact form error:", error);

        return new Response(
            "We couldn't send your message. Please try again.",
            {
                status: 400,
                headers: {
                    "Content-Type": "text/plain; charset=UTF-8"
                }
            }
        );
    }
}