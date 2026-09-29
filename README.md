# Algo the Bunny

A game for kids, helping them learning to program.

Try it out at [https://algo-the-bunny.education/](https://algo-the-bunny.education/).

We need help. The learning curve is to steep, and we don't have
enough levels. If you are an educator or love to program, consider
contributing levels or get in contact: juergen.mangler@gmail.com.

## Designing your own level

A level is a plain text file with 9 sections, in order, each separated by a
line containing exactly `---`:

1. **Tiles** — the field layout (see the character table below).
2. **Assignments** — one value per line, referenced by flowers, random carrots and jump targets.
3. **Title** — short title shown above the mission text.
4. **Order** — short instruction line, spoken and shown at the top of the mission popup.
5. **Mission** — the mission text (Markdown), shown in the mission popup.
6. **Carrots** — the required order of carrot values to eat (see below).
7. **Times** — how many successful runs are needed; `0` or `1` means once is enough.
8. **Max score** — reference score shown in the victory dialog.
9. **Elements** — comma-separated list of commands available in this level, e.g. `forward,left,right,if_hole*2` (`*N` limits how many times that command may be used).

### Tile characters

| Char | Meaning |
|---|---|
| `' '` (space) / absent | Void — no tile. Not walkable; this is what `if_hole` detects. |
| `T` | Plain walkable floor tile. |
| `1`–`9` | Carrot with a fixed literal value. |
| `c` | Carrot with a random value, drawn from a shuffled pool of `1..max_carrots` (reshuffled if it would repeat the previous session's placement). |
| `f` | Flower. Its value comes from the assignments section — see below. |
| `+` `-` `*` `/` | Arithmetic operator tile — walkable floor that also carries an op (`plus`/`minus`/`div`/`times`). |
| `G` | "No-count" floor tile — walkable, but exempt from step/coverage counting (e.g. for "visit everywhere" missions). |
| `N` `E` `S` `W` | Direction sign — walkable floor with a directional arrow; sets the bunny's facing when a `jump` lands there. |
| `B` | Bunny start position. Always faces East, regardless of any direction tile. Exactly one expected per level. |
| anything else | Drawn as a plain floor tile (ignored by the game logic) — a typo trap. |

### Assignments

Each line is one of:
- `r<N>` — random integer from 1 to N (re-rolled if it would repeat last session's value).
- `f<idx>` — copies the value of assignment `idx` (0-based).
- a plain number — a literal value.
- `x,y,face` — a position (`face` is one of `N`/`E`/`S`/`W`), used for jumps/memorized positions.

Flowers (`f` tiles) consume assignments in the order the grid is scanned
diagonally, top-left to bottom-right (the same order the field is drawn in)
— for a single row or column of flowers that's just left-to-right /
top-to-bottom.

### Carrots field

- a plain digit string, e.g. `123` — carrots must be eaten in exactly this value order.
- `t<idx>,<digit>` — repeats `<digit>`, `assignments[idx].value` times.
- `s<idx>` — a single digit, taken from `assignments[idx].value`.
