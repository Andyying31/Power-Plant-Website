export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === "/api/shared-note") {
            return handleSharedNote(request, env);
        }

        return env.ASSETS.fetch(request);
    }
};

async function handleSharedNote(request, env) {
    if (!env.SHARED_BOARD) {
        return jsonResponse(
            {
                ok: false,
                error: "SHARED_BOARD KV binding is not configured."
            },
            503
        );
    }

    if (request.method === "GET") {
        const stored = await env.SHARED_BOARD.get("shared-note", "json");

        return jsonResponse({
            ok: true,
            content: stored?.content || "",
            updatedAt: stored?.updatedAt || null
        });
    }

    if (request.method === "PUT") {
        let body;

        try {
            body = await request.json();
        } catch {
            return jsonResponse(
                {
                    ok: false,
                    error: "Invalid JSON body."
                },
                400
            );
        }

        const content =
            typeof body.content === "string"
                ? body.content
                : "";

        if (content.length > 100000) {
            return jsonResponse(
                {
                    ok: false,
                    error: "Shared note is too large."
                },
                413
            );
        }

        const updatedAt = new Date().toISOString();

        await env.SHARED_BOARD.put(
            "shared-note",
            JSON.stringify({
                content,
                updatedAt
            })
        );

        return jsonResponse({
            ok: true,
            updatedAt
        });
    }

    return new Response("Method Not Allowed", {
        status: 405,
        headers: {
            "Allow": "GET, PUT"
        }
    });
}

function jsonResponse(data, status = 200) {
    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Cache-Control": "no-store"
            }
        }
    );
}
