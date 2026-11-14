import Link from "next/link";
export default function HomePage() {
  return <main id="main-content" className="shell">
    <section className="hero">
      <div><p className="eyebrow">Your school community</p><h1>Find your place.<br />Make it yours.</h1><p className="lede">Discover what happens beyond the classroom, with activity information maintained by the people who know it best.</p><Link className="button primary" href="/login">Sign in to your school <span aria-hidden="true">→</span></Link></div>
      <aside className="welcome-panel"><span className="overline">Room to explore</span><h2>Start with curiosity.</h2><p>A new interest. A team to join. A community to be part of.</p><div className="topic-list"><span>Science & discovery</span><span>Arts & expression</span><span>Teams & service</span></div></aside>
    </section>
    <section className="section"><p className="eyebrow">Built for school communities</p><div className="three-columns">
      <article><h2>Students</h2><p>Find reliable information about opportunities at your school.</p></article>
      <article><h2>Staff</h2><p>Keep students informed about the activities you maintain.</p></article>
      <article><h2>Administrators</h2><p>Support your school with clear responsibilities and access.</p></article>
    </div></section>
  </main>;
}
