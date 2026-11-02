# Project log

Keep this up to date as you go — a few lines per work session is enough. It's much harder to reconstruct at the end.

**Team name:**
**Startup name:** Sprout
**Live site link:**

---

## Work sessions

Copy this block for each session.

### Session — 2026-11-02 — driver: not recorded

- **Goal for this session:** Turn the starter site into a plant-watering reminder app and explore a possible revenue model.
- **Key prompts we gave Copilot** (paste the important ones):
  1. "I want an application that will remind me to water my plants. Some plants are thirsty and need daily watering, some maybe once every few weeks. I want to be able to add and remove plants. Help me monetize this app."
  2. "Looks like the CSS didn't come through on the preview."
- **What worked:** Built Sprout's dashboard with sample plants, configurable watering intervals, due/upcoming filters, mark-watered and remove actions, local browser storage, optional browser notifications, and an empty-garden state. Tested add, water, remove, and reload flows with an in-memory harness. Added a freemium concept: five plants free, with a proposed $2.99/month Plus plan for unlimited plants, shared reminders, and seasonal care plans.
- **What broke, and how we fixed it:** The preview was unstyled because `index.html` had duplicate document markup and was missing the `styles.css` link. Repaired the document structure and restored the stylesheet reference; verified the link and document structure.
- **Committed?** no — not committed.

---

## Things that broke (running list)

| Date | What went wrong | What we tried | What finally fixed it |
|---|---|---|---|
| 2026-11-02 | Preview showed the app without styling. | Checked the stylesheet file and HTML document structure. | Removed duplicate opening markup and restored the `styles.css` link in `index.html`. |

## What a real version would need

Everything we wanted but faked or left out — real logins, a real database, payments, security, moderation, an app, staff, etc. For each one, say **why** it's needed and roughly **how hard or expensive** you think it would be.

| Feature we faked or skipped | Why a real company would need it | How hard / expensive? |
|---|---|---|
| Secure accounts and cloud database | Sync a garden between devices and protect customer data; local browser storage only works on this device. | Medium to high: backend, database, authentication, hosting, and ongoing security work. |
| Background reminders | Browser notifications in this prototype only work when the site is opened; reliable reminders need push notifications or a mobile app. | Medium: notification infrastructure, permission handling, and ongoing delivery maintenance. |
| Subscription payments | The $2.99/month Plus price is only a concept; real upgrades need checkout, billing management, and cancellation/refund support. | Medium: payment provider integration, legal/tax setup, customer support, and pricing validation. |

## Reflection (fill in at the end)

1. What surprised you most about building software with AI?
2. Which parts were easy, and which were hard? Why do you think that is?
3. If a competitor had the same AI tool, how long would it take them to copy your site?
