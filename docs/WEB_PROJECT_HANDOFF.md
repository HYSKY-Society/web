> Made by ChatGPT Codex â€” updated 2026-08-13 16:26:39 -05:00

# HySky Web Project Handoff

## Purpose

This project owns the HySky member and news websites. It is separate from the system that researches and writes news drafts.

## Sites and services

- `connect.hysky.org`: member community, feed, courses, events, profiles, administration, and the press editor.
- `news.hysky.org`: HySky News landing page, article archive, article pages, subscriptions, and metered access.
- Clerk: shared identity and sign-in across Connect and News.
- Neon: application data, membership/access records, press posts, and article-view metering.
- Vercel: website hosting and deployment.
- Zeffy: external payment forms for news subscriptions and VIP membership.
- `hysky.org` on Wix: public organizational website only. Wix Members/login is not used.

## Membership model

- **Free:** may view the Connect feed, like and comment, browse available courses, and read one HySky News article per calendar month. Posting, direct messages, and complete member profiles require an upgrade. Course details may be browsed, but paid course content remains gated.
- **VIP member:** paid Connect membership, with the paid community benefits and unlimited HySky News access.
- **News Monthly:** unlimited HySky News and archive access; does not by itself grant VIP Connect benefits.
- **News Annual:** unlimited HySky News and archive access; does not by itself grant VIP Connect benefits.

The user-facing label is **VIP member**, not â€œFull member.â€ Always spell the brand **HySky**.

## Website responsibilities

This repository owns:

- page layout, navigation, branding, and responsive behavior;
- Space Grotesk typography and established HySky color styling;
- shared Clerk sign-in between Connect and News;
- membership and article-access checks;
- Zeffy subscription links or approved popups;
- Connect feed/community permissions;
- course and event presentation;
- press-post editing, draft review, publishing, ordering, images, and SEO rendering;
- the protected server endpoint that accepts a structured unpublished draft;
- the admin control that requests an automation run and displays its result.

It does not own news discovery, editorial source rules, AI prompts, research, deduplication, or article generation. Those belong in `HYSKY-Society/hysky-news-automation`.

## News automation connection

The website should expose only a narrow contract:

1. A protected admin route requests either a normal scan or an optional editor-entered topic from Azure.
2. Azure returns run status and, when successful, a draft identifier or review path.
3. A separate secret-protected ingest route validates a structured article and inserts it into `press_posts` with `is_published = false`.
4. The administrator reviews and explicitly publishes the article.

Do not place the editorial decision-making rules in the React admin form. The form is a control and review surface, not the research engine.

## Current automation warning

As of 2026-08-13 16:26:39 -05:00, the news automation is not accepted as working:

- editor-directed runs can fail because the `SelectionDecision` structured response is missing the required `uncertainties` field;
- normal runs can complete with only an irrelevant hydrogen-bicycle candidate and produce no draft.

These are automation-repository issues. Do not redesign the website to mask them. The detailed record and future acceptance test are in `HYSKY-Society/hysky-news-automation/NEWS_AUTOMATION_HANDOFF.md`.

## How to resume in a separate Codex task

Start a task named something like **HySky Web / Connect** and provide this instruction:

> Work only in `HYSKY-Society/web`. Read `docs/WEB_PROJECT_HANDOFF.md` first. Preserve the shared Clerk login, Neon membership model, news paywall, and draft-only automation boundary. Do not change the news research pipeline.

Use a separate task for news discovery, article-generation prompts, schedules, source rules, and Azure automation debugging.


