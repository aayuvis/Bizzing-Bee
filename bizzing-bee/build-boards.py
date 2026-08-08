# Bizzing Bee board art — flat vector posters in the product's own visual language.
# 16:9, composed per concept, honey + violet palette, honeycomb motif, no raster.
import json

W, H = 640, 360
P = dict(cream="#F6F2E8", ink="#2A2140", violet="#6C4FE0", vio2="#8B6FF0",
         honey="#FFC23D", honey2="#E39A12", dusk="#241C3C", night="#171130",
         mist="#CFC6EE", warm="#FFF6E4")

def hexes(n=9, y=None, o=".10", c=None):
    c = c or P["violet"]; out = []
    for i in range(n):
        x = 26 + i * 72; yy = (34 if i % 2 else 88) if y is None else y
        out.append(f'<path d="M{x} {yy-13}l11 6.5v13l-11 6.5-11-6.5v-13z" fill="none" '
                   f'stroke="{c}" stroke-opacity="{o}" stroke-width="2"/>')
    return "".join(out)

def bee(x, y, s=1, wing=P["mist"]):
    return (f'<g transform="translate({x} {y}) scale({s})">'
            f'<ellipse cx="0" cy="-9" rx="13" ry="9" fill="{wing}" opacity=".85" transform="rotate(-22)"/>'
            f'<ellipse cx="8" cy="-9" rx="13" ry="9" fill="{wing}" opacity=".7" transform="rotate(22)"/>'
            f'<ellipse cx="0" cy="0" rx="15" ry="12" fill="{P["honey"]}"/>'
            f'<path d="M-4 -11a12 12 0 0 0 0 22z" fill="{P["ink"]}" opacity=".9"/>'
            f'<path d="M6 -10.5a12 12 0 0 1 0 21" stroke="{P["ink"]}" stroke-width="4" fill="none" opacity=".9"/>'
            f'<circle cx="11" cy="-3" r="2" fill="{P["ink"]}"/></g>')

def figure(x, y, s=1, c=None, head=True):
    c = c or P["ink"]
    o = f'<g transform="translate({x} {y}) scale({s})">'
    if head: o += f'<circle cx="0" cy="-26" r="11" fill="{c}"/>'
    o += f'<path d="M-14 6c0-13 6-21 14-21s14 8 14 21z" fill="{c}"/></g>'
    return o

def frame(bg, body, band=None):
    b = f'<rect width="{W}" height="{H}" fill="{bg}"/>'
    if band: b += band
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
            f'width="{W}" height="{H}" role="img">{b}{body}</svg>')

# ---------------- boards ----------------
def dinner():
    b = hexes(o=".07", c=P["honey"])
    b += f'<rect x="88" y="196" width="464" height="16" rx="8" fill="{P["ink"]}" opacity=".92"/>'
    b += f'<rect x="120" y="212" width="12" height="52" fill="{P["ink"]}" opacity=".55"/>'
    b += f'<rect x="508" y="212" width="12" height="52" fill="{P["ink"]}" opacity=".55"/>'
    for cx in (168, 236, 404, 472):
        b += f'<ellipse cx="{cx}" cy="192" rx="26" ry="7" fill="{P["warm"]}" opacity=".9"/>'
    b += figure(180, 168, 1.25, P["ink"])
    b += figure(300, 160, 1.15, P["violet"])          # the child, ahead
    b += figure(452, 168, 1.25, P["ink"])
    b += f'<circle cx="300" cy="96" r="30" fill="{P["honey"]}" opacity=".22"/>'
    b += f'<text x="300" y="106" text-anchor="middle" font-family="Georgia,serif" font-size="34" fill="{P["honey2"]}">?</text>'
    return frame(P["cream"], b)

def groupchat():
    b = hexes(o=".08", c=P["vio2"])
    rows = [(70, 96, 250, P["mist"]), (300, 150, 268, P["vio2"]), (70, 204, 210, P["mist"])]
    for x, y, w, c in rows:
        b += f'<rect x="{x}" y="{y}" width="{w}" height="44" rx="20" fill="{c}" opacity=".95"/>'
        for i in range(3):
            b += f'<rect x="{x+22+i*0}" y="{y+14}" width="{int(w*0.45)}" height="7" rx="3.5" fill="{P["ink"]}" opacity=".3"/>'
            break
        b += f'<rect x="{x+22}" y="{y+26}" width="{int(w*0.7)}" height="7" rx="3.5" fill="{P["ink"]}" opacity=".18"/>'
    b += f'<rect x="300" y="258" width="268" height="44" rx="20" fill="{P["honey"]}"/>'
    b += f'<rect x="322" y="272" width="150" height="8" rx="4" fill="{P["ink"]}" opacity=".55"/>'
    b += f'<rect x="322" y="286" width="96" height="8" rx="4" fill="{P["ink"]}" opacity=".35"/>'
    b += bee(560, 292, .8)
    return frame(P["cream"], b)

def boardgame():
    b = ""
    gx, gy, c, n = 168, 60, 40, 6
    for r in range(n):
        for col in range(n):
            fill = P["warm"] if (r + col) % 2 else "#EFE7D6"
            b += f'<rect x="{gx+col*c}" y="{gy+r*c}" width="{c-3}" height="{c-3}" rx="4" fill="{fill}"/>'
    word = "SPELL"
    for i, ch in enumerate(word):
        x = gx + (i) * c
        b += (f'<rect x="{x}" y="{gy+3*c}" width="{c-3}" height="{c-3}" rx="4" fill="{P["honey"]}"/>'
              f'<text x="{x+(c-3)/2}" y="{gy+3*c+26}" text-anchor="middle" font-family="Georgia,serif" '
              f'font-size="20" font-weight="700" fill="{P["ink"]}">{ch}</text>')
    b += figure(96, 300, 1.0, P["ink"]); b += figure(544, 300, 1.0, P["ink"])
    return frame(P["cream"], b)

def car():
    b = f'<rect width="{W}" height="{H}" fill="{P["night"]}"/>'
    b += f'<path d="M0 300 L{W} 262 L{W} {H} L0 {H}z" fill="{P["dusk"]}"/>'
    for i in range(14):
        b += f'<rect x="{20+i*46}" y="{306-i*2}" width="20" height="3" rx="1.5" fill="{P["mist"]}" opacity=".22"/>'
    b += f'<rect x="236" y="120" width="168" height="112" rx="12" fill="{P["violet"]}" opacity=".28"/>'
    b += f'<rect x="252" y="134" width="136" height="84" rx="8" fill="{P["honey"]}" opacity=".92"/>'
    b += f'<rect x="272" y="160" width="96" height="9" rx="4.5" fill="{P["ink"]}" opacity=".45"/>'
    b += f'<rect x="272" y="180" width="62" height="9" rx="4.5" fill="{P["ink"]}" opacity=".28"/>'
    b += figure(320, 264, 1.5, P["ink"])
    for i, cx in enumerate((70, 120, 560, 596)):
        b += f'<circle cx="{cx}" cy="{50+i*14}" r="2" fill="{P["mist"]}" opacity=".5"/>'
    return frame(P["night"], b)

def wall():
    b = ""
    for r in range(7):
        for c in range(16):
            op = .95 - (r * .02)
            fill = P["honey"] if (r * 16 + c) % 11 == 0 else P["warm"]
            b += (f'<rect x="{28+c*37}" y="{26+r*36}" width="30" height="28" rx="4" fill="{fill}" opacity="{op}"/>'
                  f'<rect x="{33+c*37}" y="{36+r*36}" width="18" height="4" rx="2" fill="{P["ink"]}" opacity=".22"/>')
    b += f'<rect x="0" y="292" width="{W}" height="68" fill="{P["cream"]}"/>'
    b += figure(320, 340, 1.5, P["violet"])
    return frame(P["mist"], b)

def headphones():
    b = hexes(o=".08")
    b += f'<circle cx="320" cy="182" r="96" fill="{P["violet"]}" opacity=".12"/>'
    b += f'<path d="M236 190a84 84 0 0 1 168 0" stroke="{P["ink"]}" stroke-width="14" fill="none" stroke-linecap="round"/>'
    b += f'<rect x="216" y="184" width="42" height="70" rx="18" fill="{P["ink"]}"/>'
    b += f'<rect x="382" y="184" width="42" height="70" rx="18" fill="{P["ink"]}"/>'
    for i, r in enumerate((26, 44, 62)):
        b += f'<circle cx="320" cy="214" r="{r}" fill="none" stroke="{P["honey"]}" stroke-width="3" opacity="{.5-i*.13}"/>'
    b += bee(320, 214, .9)
    return frame(P["cream"], b)

def classroom():
    b = f'<rect x="0" y="0" width="{W}" height="196" fill="{P["dusk"]}"/>'
    b += f'<rect x="92" y="36" width="456" height="124" rx="8" fill="{P["ink"]}" opacity=".55"/>'
    b += f'<rect x="122" y="70" width="200" height="10" rx="5" fill="{P["honey"]}" opacity=".8"/>'
    b += f'<rect x="122" y="94" width="290" height="10" rx="5" fill="{P["mist"]}" opacity=".45"/>'
    b += f'<rect x="122" y="118" width="150" height="10" rx="5" fill="{P["mist"]}" opacity=".3"/>'
    b += f'<rect x="140" y="236" width="360" height="14" rx="7" fill="{P["ink"]}" opacity=".9"/>'
    b += figure(200, 232, 1.15, P["ink"]); b += figure(280, 232, 1.15, P["ink"])
    b += figure(430, 226, 1.3, P["violet"])
    return frame(P["cream"], b)

def book():
    b = hexes(o=".07", c=P["honey"])
    b += f'<ellipse cx="320" cy="300" rx="180" ry="18" fill="{P["ink"]}" opacity=".10"/>'
    for i, (dx, dy, c) in enumerate(((0, 0, P["violet"]), (-8, -16, P["vio2"]), (6, -32, P["honey"]))):
        b += f'<rect x="{188+dx}" y="{206+dy}" width="264" height="26" rx="5" fill="{c}"/>'
    b += f'<rect x="196" y="120" width="248" height="60" rx="6" fill="{P["warm"]}" stroke="{P["ink"]}" stroke-opacity=".18"/>'
    b += f'<rect x="318" y="120" width="4" height="60" fill="{P["ink"]}" opacity=".14"/>'
    b += f'<rect x="300" y="120" width="10" height="86" fill="{P["honey"]}"/>'
    b += bee(452, 128, .85)
    return frame(P["cream"], b)

def crew():
    b = f'<circle cx="320" cy="200" r="150" fill="{P["honey"]}" opacity=".16"/>'
    b += hexes(o=".10", c=P["violet"])
    for i, (x, y, s) in enumerate(((190, 196, .95), (256, 158, .8), (320, 202, 1.5),
                                   (392, 158, .8), (452, 196, .95))):
        b += bee(x, y, s)
    for x in (140, 240, 400, 500):
        b += (f'<path d="M{x} 306 q10 -34 0 -52 q22 12 34 0 q-6 32 -34 52z" fill="{P["vio2"]}" opacity=".55"/>')
    return frame(P["cream"], b)

def bedside():
    b = f'<rect width="{W}" height="{H}" fill="{P["dusk"]}"/>'
    b += f'<circle cx="320" cy="160" r="150" fill="{P["honey"]}" opacity=".13"/>'
    for i, (w, c) in enumerate(((236, P["violet"]), (212, P["vio2"]), (188, P["honey2"]))):
        y = 268 - i * 26
        b += f'<rect x="{320-w//2}" y="{y}" width="{w}" height="24" rx="5" fill="{c}"/>'
    b += f'<rect x="252" y="164" width="136" height="26" rx="6" fill="{P["mist"]}"/>'
    b += f'<rect x="264" y="172" width="80" height="9" rx="4.5" fill="{P["ink"]}" opacity=".35"/>'
    b += bee(320, 124, 1.1)
    return frame(P["dusk"], b)

def mic():
    b = hexes(o=".08")
    b += f'<circle cx="320" cy="170" r="86" fill="{P["violet"]}" opacity=".12"/>'
    b += f'<rect x="298" y="96" width="44" height="94" rx="22" fill="{P["ink"]}"/>'
    for i in range(4):
        b += f'<rect x="304" y="{112+i*18}" width="32" height="4" rx="2" fill="{P["mist"]}" opacity=".5"/>'
    b += f'<path d="M268 176a52 52 0 0 0 104 0" stroke="{P["ink"]}" stroke-width="9" fill="none" stroke-linecap="round"/>'
    b += f'<rect x="315" y="228" width="10" height="46" fill="{P["ink"]}"/>'
    b += f'<rect x="272" y="274" width="96" height="12" rx="6" fill="{P["ink"]}"/>'
    b += f'<rect x="120" y="150" width="70" height="10" rx="5" fill="{P["honey"]}" opacity=".8"/>'
    b += f'<rect x="452" y="150" width="70" height="10" rx="5" fill="{P["honey"]}" opacity=".35"/>'
    return frame(P["cream"], b)

def countdown():
    b = ""
    for r in range(3):
        for c in range(7):
            n = r * 7 + c
            done = n < 14
            fill = P["honey"] if done else P["warm"]
            b += f'<rect x="{92+c*66}" y="{72+r*72}" width="56" height="56" rx="10" fill="{fill}"/>'
            if done:
                b += (f'<path d="M{104+c*66} {100+r*72} l10 10 l20 -22" stroke="{P["ink"]}" '
                      f'stroke-width="5" fill="none" stroke-linecap="round" stroke-opacity=".55"/>')
    b += f'<rect x="422" y="216" width="56" height="56" rx="10" fill="{P["violet"]}"/>'
    b += bee(450, 244, .7, P["warm"])
    return frame(P["cream"], b)

def waveform():
    b = f'<rect width="{W}" height="{H}" fill="{P["dusk"]}"/>'
    import math
    for i in range(46):
        x = 40 + i * 13
        h1 = 10 + abs(math.sin(i * .55)) * 62
        b += f'<rect x="{x}" y="{130-h1/2:.0f}" width="6" height="{h1:.0f}" rx="3" fill="{P["mist"]}" opacity=".45"/>'
        h2 = 10 + abs(math.sin(i * .3 + 1)) * 96
        b += f'<rect x="{x}" y="{262-h2/2:.0f}" width="6" height="{h2:.0f}" rx="3" fill="{P["honey"]}"/>'
    b += f'<text x="40" y="52" font-family="ui-monospace,monospace" font-size="14" fill="{P["mist"]}" opacity=".7">SYNTHETIC</text>'
    b += f'<text x="40" y="330" font-family="ui-monospace,monospace" font-size="14" fill="{P["honey"]}">RECORDED</text>'
    return frame(P["dusk"], b)

def plateau():
    b = hexes(o=".07", c=P["violet"])
    b += (f'<path d="M60 300 C150 300 150 150 240 150 C300 150 300 132 360 132 '
          f'L520 132" stroke="{P["violet"]}" stroke-width="7" fill="none" stroke-linecap="round"/>')
    b += f'<path d="M360 132 L520 132" stroke="{P["honey"]}" stroke-width="9" stroke-linecap="round"/>'
    b += f'<circle cx="520" cy="132" r="11" fill="{P["honey"]}"/>'
    b += f'<rect x="60" y="316" width="460" height="4" rx="2" fill="{P["ink"]}" opacity=".2"/>'
    b += bee(552, 96, .8)
    return frame(P["cream"], b)

def firstword():
    b = hexes(o=".07", c=P["honey"])
    b += f'<rect x="140" y="252" width="360" height="14" rx="7" fill="{P["ink"]}" opacity=".9"/>'
    b += f'<rect x="286" y="212" width="68" height="42" rx="6" fill="{P["vio2"]}"/>'
    b += figure(320, 196, 1.1, P["violet"])
    b += figure(180, 250, 1.15, P["ink"]); b += figure(460, 250, 1.15, P["ink"])
    b += f'<rect x="196" y="70" width="248" height="58" rx="16" fill="{P["honey"]}"/>'
    b += f'<path d="M300 128 l14 22 l14 -22z" fill="{P["honey"]}"/>'
    for i, w in enumerate((150, 190, 110)):
        b += f'<rect x="216" y="{84+i*14}" width="{w}" height="7" rx="3.5" fill="{P["ink"]}" opacity="{.5-i*.12}"/>'
    return frame(P["cream"], b)

def autocorrect():
    b = hexes(o=".08")
    b += f'<rect x="196" y="72" width="248" height="216" rx="20" fill="{P["ink"]}"/>'
    b += f'<rect x="210" y="92" width="220" height="176" rx="10" fill="{P["warm"]}"/>'
    b += f'<rect x="230" y="120" width="150" height="11" rx="5.5" fill="{P["ink"]}" opacity=".28"/>'
    b += f'<rect x="230" y="146" width="180" height="11" rx="5.5" fill="{P["honey2"]}"/>'
    b += f'<path d="M230 164 q10 6 20 0 q10 -6 20 0 q10 6 20 0 q10 -6 20 0" stroke="{P["honey2"]}" stroke-width="3" fill="none"/>'
    b += f'<rect x="230" y="192" width="120" height="11" rx="5.5" fill="{P["ink"]}" opacity=".18"/>'
    b += f'<circle cx="470" cy="200" r="26" fill="{P["violet"]}" opacity=".2"/>'
    b += f'<path d="M456 200 l10 10 l20 -22" stroke="{P["violet"]}" stroke-width="6" fill="none" stroke-linecap="round"/>'
    return frame(P["cream"], b)

BOARDS = {
 "BB01_dinner": dinner, "BB02_groupchat": groupchat, "BB03_scrabble": boardgame,
 "BB04_autocorrect": autocorrect, "BB05_tunnel": car, "BB06_wallchart": wall,
 "BB07_voice": headphones, "BB08_parentteacher": classroom, "BB09_spine": book,
 "BB10_cast": crew, "BB11_firstword": firstword, "BB12_bedtime": bedside,
 "C1_fortnight": countdown, "C2_french": waveform, "C3_oral": mic, "C4_plateau": plateau,
}

if __name__ == "__main__":
    out = {k: fn() for k, fn in BOARDS.items()}
    open('/tmp/claude-0/-home-user-Bizzing-Bee/4e23cfba-e7d7-5db3-a77c-4dd0a1079ba5/bbart.json','w').write(
        json.dumps(out))
    print("boards:", len(out), "| total KB", sum(len(v) for v in out.values())//1024)
