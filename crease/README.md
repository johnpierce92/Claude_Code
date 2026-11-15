# Crease

A daily folding-map geography game. One country is hidden. Ask yes/no
questions and each answer folds the ruled-out countries away. Latitude and
longitude questions fold the paper along that line. Name the country before
your 10 creases run out.

## Play

Open `index.html` in a browser. There's no build step and no server. It loads
`data.js` from the same folder. Progress and stats are saved in `localStorage`.

## Rules

- Each question costs one crease, and so does each wrong guess. A correct
  guess is free.
- Your score is the number of creases used.
- There's one daily puzzle for everyone, which rolls over at midnight UTC.
  **Practice** gives you a random country.

## Regenerating map data

`data.js` comes from Natural Earth 1:110m boundaries (via `world-atlas`) and
country facts from `world-countries`:

```sh
npm i world-atlas@2.0.2 world-countries@5.1.0 d3-geo@3.1.1 topojson-client@3.1.0
node crease/tools/build-data.mjs > crease/data.js
```
