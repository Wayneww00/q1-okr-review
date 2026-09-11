import {
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";

const COOKIE_NAME = "vantage_session";
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const JSON_HEADERS = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
  "x-content-type-options": "nosniff",
};

function jsonResponse(body, { status = 200, headers = {} } = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...headers },
  });
}

function digest(value) {
  return createHash("sha256").update(String(value), "utf8").digest();
}

function securelyEqual(value, expected) {
  return timingSafeEqual(digest(value), digest(expected));
}

function signature(payload, secret) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function createSessionToken(username, secret, now = Date.now()) {
  const claims = {
    sub: createHash("sha256")
      .update(String(username), "utf8")
      .digest("hex")
      .slice(0, 24),
    exp: Math.floor(now / 1000) + SESSION_TTL_SECONDS,
  };
  const payload = Buffer.from(JSON.stringify(claims), "utf8").toString(
    "base64url",
  );
  return {
    claims,
    token: `${payload}.${signature(payload, secret)}`,
  };
}

function verifySessionToken(token, secret, now = Date.now()) {
  try {
    const [payload, suppliedSignature, extra] = String(token || "").split(".");
    if (!payload || !suppliedSignature || extra) return null;
    if (!securelyEqual(suppliedSignature, signature(payload, secret))) {
      return null;
    }
    const claims = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    if (
      typeof claims.sub !== "string" ||
      !Number.isFinite(claims.exp) ||
      claims.exp <= Math.floor(now / 1000)
    ) {
      return null;
    }
    return claims;
  } catch {
    return null;
  }
}

function readCookie(request, name) {
  const source = request.headers.get("cookie") || "";
  for (const segment of source.split(";")) {
    const separator = segment.indexOf("=");
    if (separator < 0) continue;
    if (segment.slice(0, separator).trim() === name) {
      return segment.slice(separator + 1).trim();
    }
  }
  return "";
}

function sessionFromClaims(claims) {
  if (!claims) return null;
  return {
    access_token: "vantage-server-session",
    expires_at: claims.exp,
    user: {
      id: `shared-${claims.sub}`,
      email: null,
    },
  };
}

function getConfiguration() {
  const username = process.env.VANTAGE_LOGIN_USERNAME || "";
  const password = process.env.VANTAGE_LOGIN_PASSWORD || "";
  const secret = process.env.VANTAGE_SESSION_SECRET || "";
  if (!username || !password || secret.length < 32) return null;
  return { username, password, secret };
}

function isSameOrigin(request) {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === new URL(request.url).origin);
}

const authHandler = {
  async fetch(request) {
    const configuration = getConfiguration();
    if (!configuration) {
      return jsonResponse(
        { error: "Authentication service unavailable" },
        { status: 503 },
      );
    }

    if (request.method === "GET") {
      const claims = verifySessionToken(
        readCookie(request, COOKIE_NAME),
        configuration.secret,
      );
      return jsonResponse({ session: sessionFromClaims(claims) });
    }

    if (request.method === "POST") {
      if (!isSameOrigin(request)) {
        return jsonResponse({ error: "Forbidden" }, { status: 403 });
      }
      const contentLength = Number(request.headers.get("content-length") || 0);
      if (contentLength > 4096) {
        return jsonResponse({ error: "Invalid request" }, { status: 413 });
      }

      let credentials;
      try {
        credentials = await request.json();
      } catch {
        return jsonResponse({ error: "Invalid request" }, { status: 400 });
      }
      const username = String(credentials?.username || "");
      const password = String(credentials?.password || "");
      const usernameMatches = securelyEqual(username, configuration.username);
      const passwordMatches = securelyEqual(password, configuration.password);
      const valid =
        username.length <= 512 &&
        password.length <= 512 &&
        usernameMatches &&
        passwordMatches;
      if (!valid) {
        return jsonResponse(
          { error: "Invalid credentials" },
          { status: 401 },
        );
      }

      const { claims, token } = createSessionToken(
        configuration.username,
        configuration.secret,
      );
      return jsonResponse(
        { session: sessionFromClaims(claims) },
        {
          headers: {
            "set-cookie": [
              `${COOKIE_NAME}=${token}`,
              "Path=/",
              `Max-Age=${SESSION_TTL_SECONDS}`,
              "HttpOnly",
              "Secure",
              "SameSite=Strict",
            ].join("; "),
          },
        },
      );
    }

    if (request.method === "DELETE") {
      if (!isSameOrigin(request)) {
        return jsonResponse({ error: "Forbidden" }, { status: 403 });
      }
      return jsonResponse(
        { session: null },
        {
          headers: {
            "set-cookie": `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`,
          },
        },
      );
    }

    return jsonResponse(
      { error: "Method not allowed" },
      { status: 405, headers: { allow: "GET, POST, DELETE" } },
    );
  },
};

export default authHandler;
