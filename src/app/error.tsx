"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main id="main-content" className="shell section narrow"><h1>We couldn’t load this page.</h1><p>Please try again. If the problem continues, contact your school administrator.</p><button className="button primary" onClick={reset}>Try again</button></main>;
}
