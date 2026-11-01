# Vector Revision Hub (version 5.2)

## Update your GitHub site
1. Unzip this. Open the `revision-hub` folder.
2. On GitHub open your repo, then **Add file**, then **Upload files**.
3. Drag in the files from inside the folder (not the folder itself). Files with the same name get replaced.
4. Press **Commit changes**. Wait about a minute, then refresh the site (Cmd+Shift+R on a Mac).

Keep the same repo name. The address stays the same, so your saved plan stays too.

## Keep your data safe
- Your plan lives in the browser you use, on that device. A new web address starts empty.
- Settings, **Download backup file**. Put the file in iCloud Drive. Do it every week or so. Vector nudges you after 7 days.
- Settings, **Restore from a file** brings everything back on any device or any new address.
- iPhone: Share, **Add to Home Screen**. Safari can clear sites you have not opened for a week, Home Screen apps are exempt.
- Moving from the old Claude version: open it, Settings, Copy backup. On the new site open Settings, "Copy and paste instead of a file", paste, Restore.

## Apple Calendar
Plan page, **Calendar** button. Choose what to include, download the .ics file.
- Make a new calendar called Revision in Apple Calendar first, then open the file and pick it.
- iPhone: open the file from Files or Downloads and tap Add All.
- It is a one-way copy. To refresh, delete the Revision calendar and import a new file.

## Live Apple Calendar (set up once)
Vector can publish your timetable as a calendar address that Apple Calendar subscribes to. It updates whenever you change your plan.
1. github.com, profile picture, **Settings**, **Developer settings**, **Personal access tokens**, **Fine-grained tokens**, **Generate new token**.
2. Name: Vector calendar. Expiration: 1 year. Repository access: **Only select repositories**, pick your site's repo.
3. Permissions, **Repository permissions**, **Contents**: **Read and write**. Nothing else. Generate and copy the token (shown once).
4. In Vector, Settings, **Live calendar**: check username and repository name, paste the token, turn on automatic publishing, press **Publish now**.
5. Press **Subscribe in Calendar** (iPhone or Mac) and confirm.
Notes: one-way only. The file is public to anyone who knows its long random address. The token is stored on that device only and is not in backups. Updates can take up to an hour to show in Apple Calendar.
When the token expires, make a new one and paste it in.

## Custom lengths and exact times (5 minute steps)
- Add box: end a topic with a length, like `Mitosis 25m`, `Quadratics 10 min` or `Paper 1 1h30`. The length menu also has 5m, 10m, 15m, 20m, 30m and 45m.
- Editor: type any length in minutes (steps of 5), or tap a quick length. Start time has hour and minute pickers, so 18:15 works.
- Pull the bottom edge of any block to resize it in 5 minute steps.
- Auto-plan packs things back to back with the exact minutes.
- Very short blocks (under 15 min) show as thin bars. Hover for the name, click to edit.

## Activities that do not count
Click any slot, choose **Activity** (gym, football, work, dinner). It sits in the timetable, blocks auto-plan, shows in the calendar file, but never counts toward revision hours or the weekly target.
