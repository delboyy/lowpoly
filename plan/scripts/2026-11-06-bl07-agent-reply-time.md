---
topic: real estate / slow replies to buyer inquiries
hook_style: B (question)
script_style: straight (control)
variable_tested: hook_style (B vs control A of BL #1–#3)
---
# BL #7 Short: How long do agents take to reply?
Slot: Short 16:00 UTC, tentatively 2026-11-06. Series: Front-Desk Leaks → sells "First Reply".
Figures: **3** (5.3 h, 48%, ~7×), all from sources the Red Team has already read (BL #2, BL #3).

## Hook (B: question)
- **Bar:** `How long do agents take to reply?`
- **Line 1:** see the script.
- Bank (not for this post): A `Agents who replied took 5.3 hours on average` · C `A buyer asks at breakfast. The agent replies after lunch.` (C is derived from 5.3 h; Red Team would need to OK it.)

## Script (straight)
| # | VO | On screen | Visual idea |
|---|---|---|---|
| 1 | [curious] When a buyer asks about a home online, how long until an agent writes back? In one US study, the agents who replied took five point three hours on average. | **5.3 h** average reply time (agents who replied) | Message bubble flies to an agency; a big clock |
| 2 | And forty-eight percent of buyer inquiries never got a reply from an agent. | **48%** no reply from an agent | Tiles turn red |
| 3 | That's from a study done for the brokerage Weichert. | US study, 2013–14 (WAV Group for Weichert) | Map of US states with pins |
| 4 | [lowered] Now compare that with research on sales leads in general. | | Camera pulls back to a city of shops |
| 5 | Reply within an hour, and you're nearly seven times likelier to qualify the lead than if you wait even an hour longer. | **~7×** likelier to qualify the lead (HBR 2011) | One shop lights up within the hour |
| 6 | [quiet] An instant first reply means no buyer waits in silence. So next time someone asks you: | → loops to line 1 | Bubble flies out again |

Length: ~101 words, ~36 s.

## Caption draft (Instagram)
> In one US study, agents who replied to buyer inquiries took 5.3 hours on average, and 48% of inquiries never got a reply from an agent (WAV Group for Weichert, 2013–14). Reply within an hour and you're ~7× likelier to qualify a lead (HBR, 2011).
>
> Want to know how fast your agency replies? DM "LEAK" for a free check.
>
> #realestate #realestateagent #dubairealestate #leads #smallbusiness

**YouTube:** the same first paragraph, then: Want a free leak check? DM "LEAK" to @fixtheleak_ on Instagram.

## Figures and sources
| Figure | Claim as written | Source |
|---|---|---|
| 5.3 h | Average response time among the 52% of inquiries that got a response | [WAV Group, Agent Responsiveness Study (for Weichert), PDF 2013, pub. Jan 2014](https://www.wavgroup.com/wp-content/uploads/2014/01/AgentResponsivenessStudy2013Final.pdf), 384 inquiries, 11 US states |
| 48% | Buyer inquiries never responded to by an agent (auto-responders not counted) | Same PDF |
| ~7× | Contacted within an hour vs even an hour later → nearly 7× as likely to qualify (1.25M web leads, 42 US firms, all industries) | Oldroyd, McElheran & Elkington, ["The Short Life of Online Sales Leads"](https://hbr.org/2011/03/the-short-life-of-online-sales-leads), HBR, Mar 2011 |

## For the Red Team
- Does 5.3 h cover only the inquiries that got a reply (as I read the BL #3 fact-check), or also auto-replies? The VO says "the agents who replied".
- Line 4 makes clear the ~7× comes from a different, cross-industry study. Is that bridge enough?
- The fix line is advice.
