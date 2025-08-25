"use client";
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");

  if (status === "loading") return <div>Loading…</div>;

  if (session) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Signed in</h1>
        <pre>{JSON.stringify(session, null, 2)}</pre>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Sign in (demo)</h1>
      <p>Type any email to sign in with the demo credentials provider.</p>
      <input
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 8, minWidth: 280 }}
      />
      <div style={{ height: 12 }} />
      <button
        onClick={() => signIn("credentials", { email, callbackUrl: "/" })}
        disabled={!email}
      >
        Sign in
      </button>
    </div>
  );
}
