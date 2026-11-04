# Auto-replies to "LEAK" (2026-10-30)

## Who does what
- **YouTube:** no DMs exist, so the description sends people to Instagram ("DM LEAK to @fixtheleak_"). Nathan answers any YouTube "LEAK" comment with: "DM LEAK to @fixtheleak_ on Instagram and we'll send it 📩".
- **Postiz** only publishes posts. It has no keyword comment-to-DM automation, so it can't do this part.
- **Instagram:** ManyChat (official Meta partner; free plan to start). Nathan connects it (his login); setup takes about 15 minutes.
- **TikTok: PAUSED 2026-10-30** (Nathan: Instagram + YouTube only). Notes kept for later. Comment-to-DM automation isn't available to most accounts in 2026 (ManyChat's TikTok comment trigger is beta in a few markets only). Nathan replies by hand once a day with the saved reply below. Expect low volume at first.
- **Claude:** can't log in to the accounts (standing rule). It writes the messages, makes each Lite leak report, and logs every request.

## Instagram: ManyChat setup (Nathan, ~15 min)
1. Switch the Instagram account to Professional (Business or Creator) if it isn't already.
2. In Instagram settings, go to Messages and story replies → Message controls → Connected tools, and turn on "Allow access to messages".
3. Go to manychat.com, sign up with Facebook, and connect the Instagram account.
4. Go to Automation → New automation → Start from template → "Auto-DM links from comments".
   - Trigger: user comments on **any post or reel**. Keyword: `LEAK` (also add `leak` and `Leak`).
     - **Set once, covers every future reel:** choose "All posts or reels" (not "Specific post" or "Next post"). If it's greyed out, it needs Pro (from about $15/mo). Checked 2026-10-30: no ManyChat MCP or API can create or update automations, so this setting is how it stays maintained.
   - **Public reply** to the comment (rotate the three so it doesn't look spammy):
     - "Sent! Check your DMs 📩"
     - "Just messaged you 👀"
     - "In your inbox now ✅"
   - **DM to send:** see "DM text" below.
5. Add a second trigger for people who DM the keyword directly: Automation → Keywords → `LEAK` → same DM.
6. Test it: comment LEAK on one reel from a different account, then confirm both the reply and the DM arrive.

## DM text (Instagram auto-DM and TikTok manual reply)
```
Hey! Thanks for asking 🙌
We'll make you a free 1-page "leak check": where your business is likely losing leads or sales, based on your public reviews and website.

Just reply with:
1) your business name
2) your website or Google Maps link

You'll get it within 48 hours. No call needed.
```

## TikTok: manual reply (once a day)
- Reply to each "LEAK" comment publicly with: "Sent you a message 📩"
- Then DM them the text above. TikTok only lets you DM people who follow you or who allow messages from everyone, so if a DM won't send, reply publicly instead: "DM us LEAK and we'll send it over."
- Optional: in TikTok Business Suite → Messages → Automated messages, set up a keyword auto-reply for `LEAK`. This auto-answers anyone who **DMs** the word.

## After a request comes in
Nathan forwards the business name and link to Claude. Claude makes the Lite report (plan/lite/TEMPLATE.md) and logs it. Nathan sends it. These requests count toward the 20 Dec gate.

## Logging requests (optional, Pro)
In the DM flow, after the person replies, add the actions **Notify admins** (pings Nathan) and **Google Sheets → Add row** (name, business, link, date). Claude reads that sheet to make the Lite reports, so nothing has to be forwarded by hand.

## Live in ManyChat (set up by Claude 2026-10-30, on Nathan's trial)
- "Auto-DM links from comments": any post or reel, keywords LEAK/leak/Leak; public replies rotate; opening DM + "Yes, I want it" button, then the ask for business name + website/Maps link.
- "Respond to all your DMs": anyone who DMs LEAK gets the same ask in one message.
- Instagram handle is **@fixtheleak_** (with underscore). "Any post or reel" is a Pro feature, so when the trial ends either keep Pro or the comment trigger stops covering new reels.
