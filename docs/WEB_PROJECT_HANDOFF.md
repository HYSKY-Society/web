> Made by ChatGPT Codex — updated 2026-08-13 16:26:39 -05:00

# HySky Web Project Handoff

## Purpose

This project owns the HySky member and news websites. It is separate from the system that researches and writes news drafts.

## Sites and services

- `connect.hysky.org`: member community, feed, courses, events, profiles, and administration.
- `news.hysky.org`: HySky News landing page, article archive, article pages, subscriptions, and metered access.
- Clerk: shared identity and sign-in across Connect and News.
- Neon: application data, membership/access records, press posts, and article-view metering.
- Vercel: website hosting and deployment.
- Zeffy: external payment forms for news subscriptions and VIP membership.
- `hysky.org` on Wix: public organizational website only. Wix Members/login is not used.

## Membership model

- **Free:** may view the Connect feed, like and comment, browse available courses, and browse HySky News article previews. Opening full News articles requires an upgrade. Posting, direct messages, and complete member profiles require an upgrade. Course details may be browsed, but paid course content remains gated.
- **VIP member:** paid Connect membership, with the paid community benefits and unlimited HySky News access.
- **News Monthly:** unlimited HySky News and archive access; does not by itself grant VIP Connect benefits.
- **News Annual:** unlimited HySky News and archive access; does not by itself grant VIP Connect benefits.

The user-facing label is **VIP member**, not “Full member.” Always spell the brand **HySky**.

## Website responsibilities

This repository owns:

- page layout, navigation, branding, and responsive behavior;
- Space Grotesk typography and established HySky color styling;
- shared Clerk sign-in between Connect and News;
- membership and article-access checks;
- Zeffy subscription links or approved popups;
- Connect feed/community permissions;
- course and event presentation;
- existing news article display, images, and SEO rendering.

It does not own news discovery, editorial source rules, AI prompts, research, deduplication, or article generation. Those belong in `HYSKY-Society/hysky-news-automation`.

## News automation retirement — 2026-10-10

The user requested removal of the unused news automation workflow. The local
source now removes the News Automation navigation item, `/admin/press` and its
article editor, both automation APIs, draft validation, automatic feed teaser
creation, and the press seed script. The user approved publishing this release
on 2026-10-10. Confirm the deployed commit in Vercel when checking live status.

Existing public news pages, subscriptions, article access rules, stored articles,
and historical database migrations remain. No database records were deleted.
The separate automation repository and external Azure services were not changed.
Do not restore the retired workflow without a new user request.

## How to resume in a separate Codex task

Start a task named something like **HySky Web / Connect** and provide this instruction:

> Work only in `HYSKY-Society/web`. Read `docs/WEB_PROJECT_HANDOFF.md` first. Preserve the shared Clerk login, Neon membership model, and news paywall. Keep the retired news automation removed. Work locally unless deployment is explicitly requested.

Use a separate task for news discovery, article-generation prompts, schedules, source rules, and Azure automation debugging.


