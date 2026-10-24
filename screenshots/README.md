# StudyFlow screenshots

No genuine screenshots are included yet. Capture them from the running application after configuring MongoDB Atlas; do not use the decorative landing-page illustration as evidence of a live dashboard. Save actual PNG files in this folder and update this list with their filenames.

## Recommended captures

1. `landing-desktop.png` — landing page at a desktop viewport.
2. `register.png` — registration form (do not show a real password or personal email).
3. `login.png` — sign-in screen (no credentials visible).
4. `dashboard.png` — signed-in dashboard with fictional tasks created in your own test account.
5. `tasks.png` — task manager showing statuses and priorities.
6. `progress.png` — progress view after completing at least one fictional task.
7. `dashboard-mobile.png` — dashboard at a phone-sized viewport with the responsive navigation visible as appropriate.

## Capture with VS Code

1. Configure `server/.env` with your Atlas URI and a private JWT secret, then run `npm install` and `npm run dev` from the project root.
2. Open the Vite address, register using a fictional demonstration name and an account you control, then create fictional academic tasks.
3. Resize the VS Code integrated browser or your browser window to desktop and phone widths (for example, about 1440px and 390px).
4. Use your operating system's screenshot shortcut or the browser's built-in screenshot feature. Crop out unrelated tabs, account details, addresses, secrets, and browser notifications.
5. Save the PNGs in this folder and update the list above. Never include passwords, Atlas connection strings, JWT secrets, or other credentials.
