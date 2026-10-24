import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { site, projects, moreWork, steps, edits, editCategories, aiWork, industries, needs, callOptions, type EditCategory } from "./data";
import { VideoTile } from "./VideoTile";

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

// cubic-bezier solver (same idea as MOTION-KIT's bezier)
const bezier = (x1: number, y1: number, x2: number, y2: number) => (t: number) => {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  let u = t;
  for (let i = 0; i < 8; i++) {
    const x = ((ax * u + bx) * u + cx) * u - t, dx = (3 * ax * u + 2 * bx) * u + cx;
    if (Math.abs(x) < 1e-5 || !dx) break;
    u -= x / dx;
  }
  return ((ay * u + by) * u + cy) * u;
};
const GLIDE = bezier(0.3, 0, 0.25, 1); // soft start, low top speed, long silky settle

// In-page links glide instead of jumping. Runs even with reduced motion, just shorter.
function useSmoothAnchors() {
  useEffect(() => {
    let raf = 0;
    const stop = () => cancelAnimationFrame(raf);
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const id = a.getAttribute("href")!.slice(1);
      const el = id === "top" ? document.body : document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      const nav = document.querySelector("nav")?.offsetHeight ?? 0;
      const from = scrollY;
      const to = id === "top" ? 0 : Math.min(el.getBoundingClientRect().top + from - nav - 8,
                                             document.documentElement.scrollHeight - innerHeight);
      const dist = Math.abs(to - from);
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const dur = reduce ? 900 : Math.min(2400, Math.max(1400, 1200 + dist * 0.15));
      const t0 = performance.now();
      stop();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / dur);
        window.scrollTo({ top: from + (to - from) * GLIDE(p), behavior: "instant" });
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
      history.replaceState(null, "", `#${id}`);
    };
    document.addEventListener("click", onClick);
    // the visitor's own wheel or touch takes over immediately
    addEventListener("wheel", stop, { passive: true });
    addEventListener("touchstart", stop, { passive: true });
    return () => {
      stop();
      document.removeEventListener("click", onClick);
      removeEventListener("wheel", stop);
      removeEventListener("touchstart", stop);
    };
  }, []);
}

// Reveal every .rv element once it scrolls into view.
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".rv").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}


function contactLinks() {
  const { email, whatsapp, instagram } = site.contact;
  return [
    email && { label: "Email me", href: `mailto:${email}` },
    whatsapp && { label: "WhatsApp", href: `https://wa.me/${whatsapp}` },
    instagram && { label: "Instagram", href: `https://instagram.com/${instagram}` },
  ].filter(Boolean) as { label: string; href: string }[];
}

// Earlier edits, filterable so a client can find the style they need.
function Edits() {
  const [cat, setCat] = useState<EditCategory | "All">("All");
  const shown = cat === "All" ? edits : edits.filter(e => e.category === cat);
  const count = (c: EditCategory) => edits.filter(e => e.category === c).length;
  return (
    <section id="edits">
      <div className="wrap">
        <div className="sec-head">
          <div><div className="kicker mono rv">Edits</div><h2 className="rv">Need a different <em>kind of edit?</em></h2></div>
          <p className="rv">Car films, music edits, motion graphics and more. Tap one to play; each shows its name while it runs.</p>
        </div>
        <div className="chips rv" role="tablist" aria-label="Filter edits">
          {(["All", ...editCategories] as const).map(c => (
            <button key={c} role="tab" aria-selected={cat === c} className={`chip${cat === c ? " on" : ""}`} onClick={() => setCat(c)}>
              {c}<span>{c === "All" ? edits.length : count(c)}</span>
            </button>
          ))}
        </div>
        <div className="edits" key={cat}>
          {shown.map((e, i) => (
            <div key={e.file} className="edit" style={d(Math.min(i, 8) * .05)}>
              <VideoTile id={e.file} aspect={e.aspect} title={e.title} src={e.src} poster={e.poster} autoplay={false} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const Chips = ({ items, on, pick }: { items: string[]; on: (x: string) => boolean; pick: (x: string) => void }) => (
  <div className="chips">
    {items.map(x => <button type="button" key={x} className={`chip${on(x) ? " on" : ""}`} aria-pressed={on(x)} onClick={() => pick(x)}>{x}</button>)}
  </div>
);

// Short project brief → opens the visitor's email app with everything filled in, then a call.
function BookCall() {
  const [industry, setIndustry] = useState("");
  const [need, setNeed] = useState<string[]>([]);
  const [call, setCall] = useState(callOptions[0]);
  const [name, setName] = useState("");
  const [idea, setIdea] = useState("");
  const toggleNeed = (n: string) => setNeed(v => v.includes(n) ? v.filter(x => x !== n) : [...v, n]);
  const ready = idea.trim().length > 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    const subject = `Project call: ${industry || "New project"}${name ? ` · ${name}` : ""}`;
    const body = [
      `Hi Yll,`, ``,
      `Industry: ${industry || "-"}`,
      `I need: ${need.join(", ") || "-"}`,
      `Call on: ${call}`, ``,
      `The idea:`, idea.trim(), ``,
      name ? `– ${name}` : "",
    ].join("\n");
    location.href = `mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form className="brief rv" style={d(.15)} onSubmit={submit}>
      <fieldset>
        <legend>Your industry</legend>
        <Chips items={industries} on={x => x === industry} pick={x => setIndustry(x === industry ? "" : x)} />
      </fieldset>
      <fieldset>
        <legend>What do you need?</legend>
        <Chips items={needs} on={x => need.includes(x)} pick={toggleNeed} />
      </fieldset>
      <label>
        <span>Your idea, in a few lines</span>
        <textarea rows={4} value={idea} onChange={e => setIdea(e.target.value)} required
                  placeholder="e.g. We're launching a booking app for gyms and need a 20-second Reel for Instagram." />
      </label>
      <div className="row">
        <label><span>Your name</span><input value={name} onChange={e => setName(e.target.value)} placeholder="Optional" autoComplete="name" /></label>
        <fieldset>
          <legend>Then we talk on</legend>
          <Chips items={callOptions} on={x => x === call} pick={setCall} />
        </fieldset>
      </div>
      <div className="send">
        <button className="btn" type="submit" disabled={!ready}>Book a call →</button>
        <p>Opens your email with everything filled in. I reply with a short idea and a time to talk.</p>
      </div>
    </form>
  );
}

// AI-made ads and posters. Hidden until files are listed in data.ts.
function AIWorkSection() {
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    addEventListener("keydown", close);
    return () => removeEventListener("keydown", close);
  }, [open]);
  if (!aiWork.length) return null;
  return (
    <section id="ai-work">
      <div className="wrap">
        <div className="sec-head">
          <div><div className="kicker mono rv">Made with AI</div><h2 className="rv">Ads and posters, <em>directed by me.</em></h2></div>
          <p className="rv">Concept, look and edit are mine. AI generates the images and shots I direct.</p>
        </div>
        <div className="ai-work">
          {aiWork.map((w, i) => (
            <div key={w.file} className="rv" style={d(Math.min(i, 6) * .06)}>
              {w.kind === "image"
                ? <button className="poster-tile" onClick={() => setOpen(w.file)} aria-label={`Open ${w.title}`}>
                    <img src={`/media/ai/${w.file}`} alt={w.title} loading="lazy" />
                  </button>
                : <VideoTile id={w.file} aspect={w.aspect} title={w.title} autoplay={false}
                             src={`/media/ai/${w.file}.mp4`} poster={`/media/ai/${w.file}.jpg`} />}
            </div>
          ))}
        </div>
      </div>
      {open && <div className="lightbox" onClick={() => setOpen(null)} role="dialog" aria-label="Poster">
        <img src={`/media/ai/${open}`} alt="" />
      </div>}
    </section>
  );
}

export default function App() {
  useReveal();
  useSmoothAnchors();
  const links = contactLinks();

  return (
    <>
      <nav>
        <div className="wrap">
          <a className="brand" href="#top"><img src="/avatar.svg" alt="" width={30} height={30} />{site.brand}</a>
          <div className="navlinks">
            <a href="#work">Work</a><a href="#edits">Edits</a><a href="#process">Process</a><a href="#ai">AI</a>
            <a className="btn" href="#contact">Book a call</a>
          </div>
        </div>
      </nav>

      <main>
        <header className="hero" id="top">
          <div className="wrap">
            <div>
              <div className="eyebrow rv"><b>{site.name}</b><span className="dot" />{site.role}<span className="dot" />{site.experience}</div>
              <h1 className="rv" style={d(.08)}>I explain apps and businesses in <em>twenty seconds.</em></h1>
              <p className="lede rv" style={d(.2)}>
                Calm, clear motion videos for products and the people behind them.{" "}
                <b>Every frame planned, your real UI rebuilt in code, every cut on the beat.</b>
              </p>
              <div className="cta rv" style={d(.3)}>
                <a className="btn" href="#work">See the work ↓</a>
                <a className="btn ghost" href="#contact">Book a call</a>
              </div>
            </div>
            <div className="hero-media rv" style={d(.25)}>
              <VideoTile id="coming-to-iphone-9x16" aspect="9x16" title="Coming to iPhone" />
              <p className="caption">Now playing: Coming to iPhone · Clarity Scheduling</p>
            </div>
          </div>
        </header>

        <section id="work">
          <div className="wrap">
            <div className="sec-head">
              <div><div className="kicker mono rv">Selected work</div><h2 className="rv">Six films, <em>six problems.</em></h2></div>
              <p className="rv">Each one starts with a real problem. Here's the problem, the idea and how it was made.</p>
            </div>
            {projects.map((p, i) => (
              <article key={p.id} className={`project${p.wide ? " wide" : i % 2 ? " flip" : ""}`}>
                <VideoTile id={p.id} aspect={p.aspect} title={p.title} className="rv" />
                <div className="story">
                  <div className="rv">
                    <div className="num mono">0{i + 1}</div>
                    <h3>{p.title}</h3>
                    <p className="meta"><b>{p.client}</b> · {p.tags.join(" · ")}</p>
                  </div>
                  <dl className="rv" style={d(.1)}>
                    <div><dt className="mono">Problem</dt><dd>{p.problem}</dd></div>
                    <div><dt className="mono">Idea</dt><dd>{p.idea}</dd></div>
                    <div><dt className="mono">How</dt><dd>{p.how}</dd></div>
                    {p.result && <div><dt className="mono">Result</dt><dd className="result">{p.result}</dd></div>}
                  </dl>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="more" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <div><div className="kicker mono rv">More work</div>
                <h2 className="rv" style={{ fontSize: "clamp(28px,3.4vw,44px)" }}>From the same studio.</h2></div>
            </div>
            <div className="rail">
              {moreWork.map((m, i) => (
                <div key={m.id} className="rv" style={d(i * .06)}>
                  <VideoTile id={m.id} aspect="9x16" title={m.title} />
                  <h4>{m.title}</h4><p>{m.line}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <AIWorkSection />

        <Edits />

        <section id="process">
          <div className="wrap">
            <div className="sec-head">
              <div><div className="kicker mono rv">Process</div><h2 className="rv">Planned before <em>it moves.</em></h2></div>
              <p className="rv">Every frame is drawn and approved before a single one is animated. You see the film on paper first.</p>
            </div>
            <div className="process">
              <ol className="steps">
                {steps.map((s, i) => (
                  <li key={s.title} className="rv" style={d(i * .06)}>
                    <span className="mono">0{i + 1}</span>
                    <div><h4>{s.title}</h4><p>{s.text}</p></div>
                  </li>
                ))}
              </ol>
              <figure className="board-grid">
                <div className="frames">
                  {Array.from({ length: 9 }, (_, i) => (
                    <img key={i} className="rv" style={d(i * .05)} src={`/media/board/frame-${i + 1}.jpg`}
                         width={264} height={474} loading="lazy" alt="" />
                  ))}
                </div>
                <figcaption className="rv">Storyboard · <b>Coming to iPhone</b></figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section id="ai">
          <div className="wrap">
            <div className="sec-head">
              <div><div className="kicker mono rv">How I work with AI</div><h2 className="rv">I direct. <em>AI speeds me up.</em></h2></div>
              <p className="rv">An honest split. The taste, story and timing are mine. AI makes the slow parts fast.</p>
            </div>
            <div className="ai">
              <div className="me rv"><h4>What I do</h4><ul>
                <li>The brief, the script and the story</li>
                <li>Storyboards and style frames, approved with you</li>
                <li>Motion design, timing and the edit</li>
                <li>Sound mix, final QA and every export</li>
              </ul></div>
              <div className="rv" style={d(.08)}><h4>Where AI helps</h4><ul>
                <li>Voiceovers, when a video needs one</li>
                <li>Generating images and textures</li>
                <li>Writing animation code faster. I still review every frame.</li>
              </ul></div>
            </div>
            <div className="build">
              <h3 className="rv">Two ways to build it.</h3>
              <div className="routes">
                <div className="rv">
                  <span className="mono">Code · Remotion + Claude</span>
                  <h4>Built in code</h4>
                  <p>The films on this page were written in Remotion, with Claude writing the code under my direction.
                     Because every frame is code, it can be automated: a new product, price or language becomes a new video,
                     for your page or your whole catalogue.</p>
                </div>
                <div className="rv" style={d(.08)}>
                  <span className="mono">Craft · After Effects</span>
                  <h4>Hand-made in After Effects</h4>
                  <p>Keyframed by hand, frame by frame, for launches that should feel like a real, physical product.</p>
                </div>
              </div>
              <p className="ai-foot rv">Same storyboard, same standard. <em>You pick the route.</em></p>
            </div>
          </div>
        </section>

        <section id="contact" className="contact">
          <div className="wrap">
            <img className="avatar rv" src="/avatar.svg" alt={`${site.brand} avatar`} width={88} height={88} />
            <div className="kicker mono rv">Contact · {site.name}</div>
            <h2 className="rv">Hard to explain? <em>Let's make it twenty seconds.</em></h2>
            <p className="lede-c rv" style={d(.1)}>Tell me your industry and the idea in a few lines. Then we hop on a call.</p>
            <BookCall />
            {links.length > 0 && <p className="note rv" style={d(.2)}>
              Or reach me directly:{" "}
              {links.map((l, i) => <span key={l.label}>{i ? " · " : ""}
                <a href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                  {l.href.startsWith("mailto:") ? site.contact.email : l.label}</a></span>)}
            </p>}
          </div>
        </section>
      </main>

      <footer><div className="wrap"><span>© {new Date().getFullYear()} {site.brand} · {site.name} · {site.location}</span><span>Built in code, like the videos.</span></div></footer>
    </>
  );
}
