import Link from "next/link";
export default function NotFound() { return <main id="main-content" className="shell section narrow"><p className="eyebrow">Page unavailable</p><h1>We couldn’t open this page.</h1><p>The link may be out of date, or this account may not have access.</p><Link className="button primary" href="/schools">Go to your schools</Link></main>; }
