# A2P Campaign Resubmission — paste-ready text

Campaign `CMa03bb9610608556a4d446467b2611145` · rejected 11 Aug 2026, error
30909 ("CTA verification issue"). The reviewer could not verify the
**verbal/in-person opt-in** because the submission named no URL and no
proof. Their exact ask: *"provide the exact URL where users sign up or
provide any proof to verify the Call-to-Action for the above mentioned
method of opt-in."*

The fix: every opt-in method below now points at an exact, public URL —
including a dedicated proof page for the in-person path:
**https://youbuycars.com/sms-consent** (live once the new site deploys —
do NOT resubmit before it's up; the reviewer will visit it).

---

## Field: "How do end-users consent to receive messages?" (Message Flow / Call-to-Action)

Paste this:

> End users opt in through one of three documented methods, all published
> at https://youbuycars.com and detailed at
> https://youbuycars.com/sms-consent :
>
> (1) WEBSITE FORM — https://youbuycars.com : the inquiry form includes an
> SMS consent checkbox that is unchecked by default and optional (the form
> submits without it, and no texts are sent unless it is checked). The
> checkbox sits directly beside the full disclosure: message purpose,
> "consent is not a condition of purchase," "message and data rates may
> apply," "message frequency varies," "Reply STOP to opt out," and links
> to the Privacy Policy and Terms.
>
> (2) CONSUMER-INITIATED TEXT — the customer texts START (or any message)
> to (313) 546-8313. This call-to-action is published at
> https://youbuycars.com with the same full disclosure printed beneath it.
>
> (3) VERBAL/IN-PERSON — a salesperson asks for consent using the exact
> published script, and records the customer's name, number, date/time,
> method, and the salesperson's own name in our CRM before any message can
> be sent; the software blocks sending to any number without a stored
> consent record. The script and the record kept are published at
> https://youbuycars.com/sms-consent for verification.
>
> Privacy Policy (incl. no-sharing-of-mobile-data clause):
> https://youbuycars.com/privacy
> Terms & Conditions: https://youbuycars.com/terms

*(Field limit is 2,048 characters; the text above is ~1,600.)*

## Field: "Opt-in keywords"

```
START, YES, UNSTOP
```

## Field: "Opt-in confirmation message"

> YouBuyCars: You're in! A real person will text you about your vehicle
> inquiry, appointments & follow-ups. Msg freq varies. Msg&data rates may
> apply. Reply HELP for help, STOP to opt out.

## Field: "Opt-out keywords"

```
STOP, STOPALL, UNSUBSCRIBE, CANCEL, END, QUIT
```

## Field: "Opt-out message"

> YouBuyCars: You're unsubscribed and will receive no further messages.
> Reply START to opt back in. Reply HELP for help.

## Field: "Help keywords" / "Help message"

```
HELP, INFO
```

> YouBuyCars: We text about your vehicle inquiry, appointments &
> follow-ups. Contact isolduacar@gmail.com. Msg&data rates may apply.
> Reply STOP to opt out.

## Field: "Campaign description"

> YouBuyCars is a car-finding service in Metro Detroit, Michigan
> (https://youbuycars.com). Customers who ask us to help find a vehicle
> receive conversational text messages about their inquiry: vehicle
> options that match their request, appointment scheduling and
> confirmations, and follow-ups on their open inquiry. All recipients have
> opted in via the website form, by texting us first, or by recorded
> verbal consent (see https://youbuycars.com/sms-consent). Messages are
> conversational and low volume.

## Sample messages (use all that fit)

1. > Hi {FirstName}, this is Dan with YouBuyCars — thanks for reaching
   > out about a mid-size SUV under $15k. I've got 2 options that fit:
   > a 2018 Equinox and a 2017 Escape. Want photos of either? Reply STOP
   > to opt out anytime.
2. > Good news {FirstName} — the 2018 Equinox you asked about is still
   > available. Want to come see it Saturday morning? I can have it pulled
   > up front.
3. > Hi {FirstName}, confirming your appointment tomorrow at 2pm at the
   > dealership. Reply YES to confirm or let me know a better time.
4. > Hey {FirstName}, just following up on your inquiry from last week —
   > still looking, or should I close it out? Either way is fine.

## Console checklist (you do these — ~10 minutes)

1. Twilio Console → Messaging → Regulatory Compliance → Campaigns → open
   the rejected campaign.
2. Replace the Message Flow / opt-in description with the block above.
3. Replace description + samples + keywords/messages per above.
4. Double-check the campaign's website field says `https://youbuycars.com`.
5. ONLY after the new site is live at youbuycars.com (so /sms-consent
   resolves): hit Resubmit.

## Why this should pass where five didn't

- 30909's demand — "exact URL or proof" for the verbal method — is now a
  live, public URL with the script, the record, and the enforcement.
- 30917 (workflow descriptions): each method is a complete workflow.
- 30925/30924 (consent language, unchecked box): quoted in the CTA text
  and visible on the page.
- 30933/30934 (policy URLs): both linked in the CTA text and in the
  site footer.
- 30919 (thin website): the site now has About, Contact, the consent
  documentation, and a working inquiry form — with inventory listings
  coming as Phase 1 lands.
