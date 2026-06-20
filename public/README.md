# Lookbook photos

Drop the three outfit photos here, named:

- `look1.jpg` — coastal boho (crochet vest + wide-leg denim)
- `look2.jpg` — quiet luxury (red silk halter + denim)
- `look3.jpg` — office siren (brown shell-button vest + denim)

Portrait 9:16 photos work best (the carousel is 1080×1920). The photo
card uses `object-fit: cover` with the focal point biased toward the
upper body (`object-position: center 22%`), so head/torso stay in
frame and only the bottom of the shoes may be cropped.

Then render:

```bash
npm run render:carousel   # 5 PNG slides ready to upload
npm run render -- LookbookCarousel out/lookbook.mp4   # animated reel
```
