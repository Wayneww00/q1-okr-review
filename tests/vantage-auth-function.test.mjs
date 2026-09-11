import assert from "node:assert/strict";

import authHandler from "../api/auth.js";

const originalEnvironment = {
  username: process.env.VANTAGE_LOGIN_USERNAME,
  password: process.env.VANTAGE_LOGIN_PASSWORD,
  secret: process.env.VANTAGE_SESSION_SECRET,
};

process.env.VANTAGE_LOGIN_USERNAME = "test-account";
process.env.VANTAGE_LOGIN_PASSWORD = "test-password";
process.env.VANTAGE_SESSION_SECRET = "test-session-secret-with-at-least-32-characters";

try {
  const wrongLogin = await authHandler.fetch(
    new Request("https://example.test/api/auth", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://example.test",
      },
      body: JSON.stringify({
        username: "test-account",
        password: "incorrect",
      }),
    }),
  );
  assert.equal(wrongLogin.status, 401);
  assert.equal(wrongLogin.headers.get("set-cookie"), null);

  const wrongAccount = await authHandler.fetch(
    new Request("https://example.test/api/auth", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://example.test",
      },
      body: JSON.stringify({
        username: "incorrect",
        password: "test-password",
      }),
    }),
  );
  assert.equal(wrongAccount.status, 401);
  assert.equal(wrongAccount.headers.get("set-cookie"), null);

  const crossOriginLogin = await authHandler.fetch(
    new Request("https://example.test/api/auth", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://attacker.test",
      },
      body: JSON.stringify({
        username: "test-account",
        password: "test-password",
      }),
    }),
  );
  assert.equal(crossOriginLogin.status, 403);

  const successfulLogin = await authHandler.fetch(
    new Request("https://example.test/api/auth", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://example.test",
      },
      body: JSON.stringify({
        username: "test-account",
        password: "test-password",
      }),
    }),
  );
  assert.equal(successfulLogin.status, 200);
  assert.equal(successfulLogin.headers.get("cache-control"), "no-store");
  const loginPayload = await successfulLogin.json();
  assert.equal(loginPayload.session.user.id.startsWith("shared-"), true);
  assert.equal(
    JSON.stringify(loginPayload).includes("test-account"),
    false,
    "the account identifier must not be echoed into browser-visible session data",
  );

  const setCookie = successfulLogin.headers.get("set-cookie");
  assert.match(setCookie, /^vantage_session=/);
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /Secure/i);
  assert.match(setCookie, /SameSite=Strict/i);
  assert.match(setCookie, /Path=\//i);
  const cookie = setCookie.split(";", 1)[0];

  const restoredSession = await authHandler.fetch(
    new Request("https://example.test/api/auth", {
      headers: { cookie },
    }),
  );
  assert.equal(restoredSession.status, 200);
  assert.equal(
    (await restoredSession.json()).session.user.id,
    loginPayload.session.user.id,
  );

  const tamperedSession = await authHandler.fetch(
    new Request("https://example.test/api/auth", {
      headers: { cookie: `${cookie}tampered` },
    }),
  );
  assert.deepEqual(await tamperedSession.json(), { session: null });

  const logout = await authHandler.fetch(
    new Request("https://example.test/api/auth", {
      method: "DELETE",
      headers: { origin: "https://example.test" },
    }),
  );
  assert.equal(logout.status, 200);
  assert.match(logout.headers.get("set-cookie"), /Max-Age=0/i);

  delete process.env.VANTAGE_SESSION_SECRET;
  const unavailable = await authHandler.fetch(
    new Request("https://example.test/api/auth", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://example.test",
      },
      body: JSON.stringify({
        username: "test-account",
        password: "test-password",
      }),
    }),
  );
  assert.equal(unavailable.status, 503, "missing secrets must fail closed");
} finally {
  const restore = (name, value) => {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  };
  restore("VANTAGE_LOGIN_USERNAME", originalEnvironment.username);
  restore("VANTAGE_LOGIN_PASSWORD", originalEnvironment.password);
  restore("VANTAGE_SESSION_SECRET", originalEnvironment.secret);
}

console.log("Vantage server authentication contract passed.");
