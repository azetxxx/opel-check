# Launch Campaign

### Campaign Name: **"Dein Auto vergisst nichts."**

**Core message**: Omiigo Car is the maintenance companion that remembers what your car needs — so you don't have to.

---

### Phase 1: Pre-Launch — Build Curiosity (Week -2 to 0)

**Goal**: Seed awareness in German car-owner communities. Get 50 email signups before launch.

### Content Pillars

| Pillar | Format | Channel | Frequency |
|--------|--------|---------|-----------|
| Pain point stories | Short posts | Reddit, motor-talk.de | 3× in 2 weeks |
| Behind-the-scenes | Dev diary snippets | Twitter/X, Mastodon | 2× per week |
| Teaser screenshots | Annotated PWA screenshots | Instagram, Twitter/X | 3× in 2 weeks |

### Pain Point Stories

Relatable micro-stories that name the problem without pitching the product:

- "Wann war der letzte Ölwechsel? Ich hab keine Ahnung."
- "TÜV in 3 Tagen. Brief lag seit 6 Wochen auf dem Küchentisch."
- "Mein Mann sagt er hat den Reifendruck geprüft. Hat er nicht."

Post these as standalone text posts in r/de, r/Autos, motor-talk.de forums. No product link — just the problem. Reply with the product link only if someone asks.

---

### Phase 2: Launch Week (Week 1)

**Goal**: Drive first 100 PWA installs. Get listed on Product Hunt and Hacker News.

### Product Hunt Launch

- **Title**: Omiigo Car — Dein Auto vergisst nichts
- **Tagline**: A PWA that tracks vehicle maintenance with zero signup. German-first, local-first, open architecture.
- **Maker comment**: Personal story — "I forgot my TÜV date twice. Built this so I never forget again."
- **First comment**: Feature list with screenshots (home dashboard, maintenance page, sharing flow)
- **Timing**: Tuesday 00:01 PT (best PH day)

### Hacker News

- **Title**: Show HN: Omiigo Car — Local-first PWA for car maintenance (Vue 3 + Supabase)
- **Angle**: Technical — local-first architecture, optional Supabase sync, RLS-based sharing. Link to architecture doc.
- **No German-only framing**: Position as "German-first but the architecture is interesting for any local-first PWA builder."

### Reddit Push

| Subreddit | Angle | Post type |
|-----------|-------|-----------|
| r/de | "Hab eine App für KFZ-Wartung gebaut" | Show & Tell |
| r/Autos | Pain point + solution | Discussion |
| r/selfhosted | Local-first, no account required, Supabase optional | Technical |
| r/webdev | PWA architecture, Vue 3 + vite-plugin-pwa | Technical |
| r/sideproject | Indie dev journey | Story |

### Forum Posts

- **motor-talk.de**: "Kennt ihr gute Wartungs-Apps?" thread — reply with product link + screenshot
- **gutefrage.net**: Answer existing "Auto Wartung App" questions with genuine recommendation

---

### Phase 3: Sustain — Weekly Content (Week 2–8)

**Goal**: Build organic traffic. Reach 50 weekly active users by week 8.

### SEO Landing Pages

Target German long-tail keywords:

| Keyword | Monthly searches (est.) | Content |
|---------|------------------------|---------|
| "auto wartung app" | 200 | Landing page: feature list + screenshots |
| "kfz checkliste" | 150 | Blog post: printable checklist + "or use the app" |
| "tüv erinnerung app" | 100 | Landing page: TÜV tracking feature focus |
| "auto inspektion erinnerung" | 80 | Blog post: inspection schedule guide |
| "reifenwechsel wann" | 300 | Blog post: seasonal tire guide + tracking |

### Weekly Content Rhythm

| Day | Channel | Content |
|-----|---------|---------|
| Monday | Blog/SEO | Maintenance tip article (targets one keyword) |
| Wednesday | Twitter/X | Feature highlight or usage tip (screenshot + 1 sentence) |
| Friday | Reddit/Forum | Engage in car maintenance threads, answer questions |

---

### Phase 4: Community & Sharing (Week 8+)

**Goal**: Organic growth through vehicle sharing feature. Each shared vehicle brings a new user.

### Sharing-Driven Growth

The vehicle sharing feature is the built-in growth loop:

1. User A sets up a vehicle and tracks maintenance
2. User A invites partner/family with an invite code
3. Partner installs the PWA and accepts the invite
4. Partner sees value → creates their own vehicle → invites someone else

### Referral Prompt

After a user has completed 5+ maintenance tasks, show a soft prompt:

> "Du nutzt Omiigo Car regelmäßig — teile dein Fahrzeug mit deinem Partner, damit ihr beide den Überblick behaltet."

No gamification, no referral codes with rewards. Just a genuine suggestion when the user is already engaged.

---

### Channel Strategy

| Channel | Role | Content type |
|---------|------|-------------|
| **Product Hunt** | Launch spike | Product listing, maker story |
| **Hacker News** | Technical credibility | Architecture deep-dive, Show HN |
| **Reddit (r/de, r/Autos)** | German car owners | Pain point posts, show & tell |
| **Reddit (r/webdev, r/selfhosted)** | Developer audience | Technical architecture, PWA patterns |
| **motor-talk.de** | Core target audience | Forum replies, genuine recommendations |
| **Twitter/X** | Ongoing presence | Feature highlights, dev updates |
| **Blog/SEO** | Long-term traffic | Maintenance guides targeting German keywords |
| **App itself (sharing)** | Organic growth | Invite codes → new users |

---

### Key Metrics to Track

| Metric | Tool |
|--------|------|
| PWA installs (add to home screen) | Custom event in analytics or service worker |
| Weekly active users (app opens) | Simple analytics / Plausible |
| Tasks marked done per user | Supabase query (cloud users) |
| Invite codes created | Supabase `vehicle_invites` count |
| Invite acceptance rate | `used_at IS NOT NULL` / total invites |
| Organic search traffic | Google Search Console |
| Product Hunt upvotes | Product Hunt dashboard |
| Reddit post engagement | Manual tracking |
