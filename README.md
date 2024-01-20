<center><img src="public/sign.png" /></center>

<center>
    <h4>One-Time Invite Link Generator For Your Discord Server With A Web Page</h4>
</center>

<a href="https://www.buymeacoffee.com/agcrisbp" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 32px !important;width: 114px !important;" ></a>
<a href="https://saweria.co/agcrisbp" target="_blank"><img src="https://bio.aghea.site/saweria-button.png" alt="Saweria" style="height: 30px !important;width: 114px !important;" ></a>
<a href="https://github.com/sponsors/agcrisbp" target="_blank"><img src="public/sponsor-badge.svg" alt="Github Sponsor" style="height: 30px !important;width: 114px !important;" ></a>

---

## Live Demo:

You can check [AD-GPT Support Server Invitation](https://aghea.fly.dev).

---

## Configuration:

- Go to your `Server Settings > Widget > Copy JSON API`.

![Widget](public/widget.png)

- Go to [script.js](public/script.js) and replace _"https://discord.com/api/guilds/1198288601696440350/widget.json"_ with the link you just copied.

- Edit lines of **index.html** in `<head>` section with your server data.

- Edit `app = "YourAppName"` in [fly.toml](fly.toml).

- Setup the `.env.example` and rename it to `.env`.

---

## Deploy To https://fly.dev

- Install the flyctl package:

```bash
npm Install -g flyctl
```

- Setup fly app:

```bash
flyctl launch
```

```bash
? Would you like to copy its configuration to the new app? Yes
```

```bash
? Do you want to tweak these settings before proceeding? Yes
```

- Set the app name based on your [fly.toml](fly.toml).

- Deploy:

```bash
flyctl deploy
```

> Next time you want to redeploy your web after editing something, just use `flyctl deploy`.

---

#### Credit:

- [0xe2d0](https://github.com/0xe2d0).
- [Ed0ardo](https://github.com/Ed0ardo).