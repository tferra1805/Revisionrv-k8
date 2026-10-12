# Vector Revision Hub

Your revision planner as a normal website. No server code, no database: just these files.

| File | What it is |
|---|---|
| index.html | The page |
| styles.css | All the styling |
| app.js | Everything the planner does |
| icon.svg, icon-180.png, icon-512.png, manifest.webmanifest | Icons so it looks like an app on your phone |
| robots.txt | Tells search engines not to list it |

## 1. Put it online (Cloudflare Pages, free)

1. Make a free account at dash.cloudflare.com.
2. In the left menu open **Workers & Pages**, then **Create application**.
3. Choose the **Pages** option, then **Drag and drop your files** (it may say "Upload assets").
4. Name the project, for example `tommaso-revision`. This becomes the address: `tommaso-revision.pages.dev`.
5. Drag the whole `revision-hub` folder (or the zip) into the upload box, then press **Deploy site**.

It is now live, but anyone with the link could open it. Step 2 fixes that.

## 2. Make it private (only your email can get in)

1. In the Cloudflare dashboard open **Zero Trust** from the left menu.
2. The first time, pick a team name and choose the **Free** plan (free for up to 50 users).
3. Go to **Access**, then **Applications**, then **Add an application**, then **Self-hosted**.
4. Under the address it should protect, enter:
   - Subdomain: `*`
   - Domain: `tommaso-revision.pages.dev` (your project address)
   - Then add a second address with the subdomain left **empty** and the same domain, so the main address is covered as well as previews.
5. Under **Policies**, create a policy:
   - Name: `Only me`
   - Action: **Allow**
   - Include rule: **Emails**, value: your email address
6. Make sure the login method **One-time PIN** is switched on (Zero Trust, Settings, Authentication).
7. Save. Open your site in a private or incognito window to test. You should be asked for your email, then get a 6-digit code by email. Anyone else is blocked.

You stay logged in for the session length you chose (for example 1 week), so you won't need a code every time.

## 3. Updating it later

When you get new versions of these files: open the project in **Workers & Pages**, press **Create new deployment**, and drag the folder in again. Your saved plan is not affected.

## 4. Put it on your phone

Open your site address in Safari, tap **Share**, then **Add to Home Screen**. It opens full screen like an app.

## Your data

- Everything you type is saved in the browser you used, on that device. Nothing is sent anywhere.
- Your phone and laptop keep separate copies. Use **Settings > Copy backup**, then **Restore backup** on the other device to move your plan across.
- Clearing your browser's site data deletes the plan, so copy a backup now and then.
- To bring over what you already planned in the Claude version: open it, Settings, Copy backup. Then open your new site, Settings, paste into Restore backup.

## Even simpler: no hosting at all

Double-click `index.html` on your laptop. It runs straight from the file, completely private, but only on that one computer.
