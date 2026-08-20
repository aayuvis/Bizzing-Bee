#!/usr/bin/env python3
"""Illustrated plates for the episode-1 film, for the shots no archive could fill.

    plates.py            list the slots and what is already on disk
    plates.py <slug>...  generate the named slots
    plates.py --all      generate whatever is missing

TWO CONVENTIONS FOR THIS FILE, both about honesty rather than taste. They govern PLATES —
the 2K illustrated backgrounds — and nothing else.

1. **Nothing here may read as a photograph.** Every plate is openly an illustration —
   inked line, flat inks, visible drawing. That is not a stylistic preference; it is what
   stops a generated image being mistaken for archive footage. Anything photoreal would be
   a fake primary source sitting next to four real Library of Congress photographs, and the
   viewer has no way to tell which is which.

2. **No portrait slots here.** There is no slot below for a specific historical person's
   face and there should not be one, because a 2K plate is exactly the object a viewer
   might read as a document. That is a decision about *this file*, not a ban on depicting
   the champions: the film shows them as app avatars from `images/av/`, which are drawn in
   an obviously cartoon register and cannot be confused with the archive photographs. See
   `spellbound-app/champions-pack.py` for why that case is the opposite one.

Register is the book series' `mature` style (see CLAUDE.md), not the app's Ghibli-painterly
one — this is 1908 social history, and the children's-picture-book look would misread the
subject badly.
"""
import base64, json, os, ssl, sys, time, urllib.request
import concurrent.futures as cf

KEY = open(os.environ.get('GKEY_FILE', '/root/.gkey')).read().strip()
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'images')
MODEL = os.environ.get('NB_MODEL', 'gemini-3-pro-image')
CTX = ssl.create_default_context(cafile='/root/.ccr/ca-bundle.crt')

# Mature graphic-novel register: hand-inked, few flat inks, generous negative space.
STYLE = (
    'Hand-inked editorial illustration in a mature graphic-novel register. Fine, even, '
    'confident ink line. Three or four flat inks only, deep indigo and warm gold and paper '
    'cream, darks used only where the drawing needs weight. Generous negative space. '
    'Historical American subject, drawn with restraint and dignity, never whimsical, never '
    'cartoonish, never cute. Clearly a DRAWING and never photographic. '
    'ABSOLUTELY NO TEXT, NO LETTERING, NO LABELS, NO NUMBERS, NO SIGNAGE, NO WRITING '
    'anywhere in the image — every sign, banner, book cover and poster is BLANK. '
    'No recognisable individual faces: any figures are small, distant, turned away or in '
    'silhouette. No modern objects. The image must run FULL BLEED to all four edges: NO paper border, NO white or cream margin, NO mount, NO frame, NO torn-paper edge, NO drop shadow around the picture, NO vignette. The artwork touches every edge of the canvas. '
)

SLOTS = {
    # §01 cold open — a period theatre. NOT the Hippodrome: we have no reference for that
    # building and captioning a drawing as a named real venue would be the same fabrication
    # the header forbids. It is "a theatre in 1908", and the narration never claims more.
    'plate-theatre-stage': (
        'The interior of a large American theatre in 1908, seen from the back of the stalls '
        'looking towards the stage. A single empty pool of light on bare boards centre stage. '
        'Tiers of balconies curve away into darkness, the audience only suggested as dim '
        'shapes. Vast, hushed, and slightly intimidating. The stage light is the brightest '
        'thing in the picture by far.', '16:9'),

    'plate-theatre-spot': (
        'Close on bare wooden stage boards under a single circle of hard overhead light, seen '
        'from slightly above. Nobody in the picture. The boards are scuffed and worn. Deep '
        'darkness all around the lit circle.', '16:9'),

    # §03 — the frontier spelling school
    'plate-schoolhouse-night': (
        'A small wooden one-room American schoolhouse alone on open prairie at night, its '
        'windows glowing warm gold, deep blue snow-lit land around it and a wide starry sky '
        'above. A few horse-drawn buggies waiting outside. Distant, quiet, inviting.', '16:9'),

    'plate-schoolroom-interior': (
        'The inside of a crowded 19th-century American one-room schoolhouse in the evening, '
        'lit by oil lamps. Rows of packed wooden benches, adults and children together, all '
        'facing one end of the room where a single small figure stands. Everyone seen from '
        'behind or in silhouette, no faces readable. Warm lamplight, deep shadows.', '16:9'),

    # §05 — why a newspaper invented the national bee
    'plate-pressroom': (
        'The pressroom of a large American newspaper in the 1920s. Enormous cast-iron rotary '
        'printing presses running, paper webs streaming through them, a few small figures in '
        'shirtsleeves and aprons dwarfed by the machinery, seen from behind. Steam and ink '
        'haze in the air, hard shafts of light from high windows.', '16:9'),

    # §08 — cerise
    'plate-shopwindow-1920s': (
        'A 1920s American department-store window at dusk, seen from the pavement outside. '
        'Dress forms displaying drop-waist evening dresses, one of them a vivid cherry-pink '
        'that is the brightest colour in the picture. Plate glass with a faint reflection of '
        'the street. Elegant, commercial, modern for its moment. No people.', '16:9'),

    # §09 — abrogate
    'plate-prohibition': (
        'A stark 1920s American courtroom or civic hall interior, empty: heavy panelled '
        'timber, tall windows, rows of vacant seats, a raised bench at one end. Cold daylight '
        'raking across the floor. Institutional, sober, entirely unoccupied.', '16:9'),

    # §04 — the medal, for the A7 animation. An object, not a replica of a specific artefact.
    'plate-medal': (
        'A single round gold medal on a plain dark indigo ground, lit from the upper left, '
        'drawn straight on and centred with a lot of empty space around it. The medal face is '
        'entirely BLANK — smooth polished metal with a plain raised rim and no design, no '
        'lettering, no engraving, no portrait of any kind. A simple ribbon above it.', '1:1'),

    # §12 — the closing return
    'plate-empty-stage-dawn': (
        'A large empty American theatre auditorium in BRIGHT ORDINARY DAYLIGHT with all the '
        'house lights ON and the stage completely bare, flat and unlit. Everything evenly '
        'and plainly lit like a room being cleaned in the morning — no spotlight anywhere, '
        'no dramatic shadow, no darkness. Empty seats, dust in the air. Calm and everyday.', '16:9'),

    # ══════════════════════════════════════════════════════════════════════════════════
    # SECOND PASS. The first cut ran 57 shots over eight and a half minutes and read as
    # static, because whole paragraphs of very concrete narration — a mail carrier, a
    # quilting bee, betting at the schoolhouse, radio arriving, gold coins, a parade, an
    # egg — had no picture at all and sat on a repeated plate instead. Every slot below is
    # a noun the narrator actually says out loud.
    # ══════════════════════════════════════════════════════════════════════════════════

    # §01 — "her father is a mail carrier"
    'plate-mail-carrier': (
        'A BLACK AFRICAN-AMERICAN uniformed letter carrier of about 1908 — dark brown skin '
        'clearly visible on his hands and the back of his neck — walking away from us down a '
        'residential street in early morning, leather satchel on his hip, peaked cap, seen '
        'from behind so no face is visible. Modest wooden houses and picket fences receding, '
        'long low sunlight, empty street. Quiet dignity, ordinary working life.', '16:9'),

    # §01/§04 — segregation, carried by architecture rather than by people. Two doors is the
    # whole statement; anything more literal would need faces this file may not draw.
    'plate-two-doors': (
        'A plain brick wall of a public building in the American South around 1908, seen '
        'straight on, with TWO separate plain doorways side by side a few feet apart. One '
        'doorway is well kept with a swept step; the other is plainer and more worn. No '
        'people, no signs, no lettering of any kind. Flat hard daylight. Stark, restrained, '
        'and quietly wrong.', '16:9'),

    # §03 — what a "bee" actually was
    'plate-quilting-bee': (
        'Six or seven women of the 1840s American frontier seated close around a large '
        'rectangular quilting frame in a plain wooden room, seen from BEHIND AND ABOVE, over '
        'their shoulders and down onto the quilt. Every woman is turned away from us: we see '
        'the backs of bonnets, shoulders, and hands at work. NO FACE IS VISIBLE AT ALL — not '
        'blank, not featureless, simply turned away, because a face drawn without features '
        'reads as a mistake. The quilt is a warm geometric field of flat colour and is the '
        'brightest thing in the picture.', '16:9'),

    'plate-husking-bee': (
        'The inside of a large American timber barn at night in the 1840s, lantern-lit, with '
        'a great heap of maize cobs on the floor and a ring of figures seated around it '
        'husking, seen from behind and in silhouette. Husks flying. Enormous dark roof '
        'timbers above, warm pools of lantern light below. Festive, communal, noisy.', '16:9'),

    'plate-betting-desk': (
        'Close on the corner of a scarred wooden schoolhouse desk in lamplight, with a small '
        'untidy pile of 19th-century American coins and folded banknotes on it, and two '
        'weathered adult hands resting near the pile — hands only, no face, cropped at the '
        'wrist. Warm low light, deep shadow beyond. Conspiratorial and cheerful.', '16:9'),

    # §04 — the venue from outside, and the news getting out
    'plate-theatre-exterior-1908': (
        'The façade of a very large American theatre in 1908 seen from across the street, '
        'crowds of small distant figures in period hats converging on its entrances, awnings '
        'and a canopy over the pavement, horse-drawn vehicles and one or two early motor cars '
        'at the kerb. Every sign board and poster panel completely BLANK. Bright summer '
        'daylight, sense of a big public occasion.', '16:9'),

    'plate-newsboys': (
        'Two newsboys of about 1908 on a city street corner, seen from behind and to the '
        'side, one with a bundle of newspapers under his arm and one arm raised calling out. '
        'Blurred crowd and storefronts beyond. The newspapers are BLANK — no headlines, no '
        'text, no lettering anywhere. Energetic, morning light, motion.', '16:9'),

    'plate-family-reading': (
        'A BLACK AFRICAN-AMERICAN family in their own kitchen in 1908 at evening, lamplit. '
        'Every person in the picture is Black with clearly DARK BROWN SKIN, visible on their '
        'hands, arms and the backs of their necks — this must be unmistakable. A seated Black '
        'father holds an open newspaper; two Black children lean against his chair to read it '
        'with him; a Black mother stands behind. All are seen FROM BEHIND or in deep profile '
        'shadow so no face is readable. The newspaper is completely BLANK. Warm, close, '
        'dignified. The oil lamp is the only light.', '16:9'),

    # §05 — the commercial pressure that invented the national bee
    'plate-radio-1920s': (
        'A 1920s American parlour at night with a large wooden cabinet radio as the centre of '
        'the room, its dial glowing warm, and a family seated in a loose semicircle facing it, '
        'all seen from behind. Patterned rug, heavy furniture, everything else in shadow. The '
        'radio dial is the brightest thing in the picture.', '16:9'),

    'plate-newsroom-desks': (
        'A 1920s American newspaper editorial room seen down its length: rows of wooden desks '
        'with heavy manual typewriters, paper spikes and telephones, a dozen figures in '
        'shirtsleeves working, all seen from behind or turned away. Hanging lamps and hard '
        'light from tall windows at the far end. All paper is BLANK. '
        'ABSOLUTELY NO SMOKING ANYWHERE: no cigarettes, no cigars, no pipes, no ashtrays, no '
        'matches, no smoke and no haze of any kind. The air is completely clear.', '16:9'),

    # §06 — the 1925 final
    'plate-museum-hall-chairs': (
        'A grand American museum hall of about 1925 set up for a contest, seen FROM THE VERY '
        'BACK OF THE ROOM looking FORWARD towards a low platform at the far end. Rows of '
        'wooden folding chairs all FACE AWAY from us TOWARDS that platform, and an audience is '
        'seated in them, every person seen from behind as heads and shoulders and hats. Tall '
        'arched windows and iron galleries above. Dust in shafts of daylight. The platform at '
        'the far end is the brightest thing in the picture.', '16:9'),

    'plate-gladiolus-garden': (
        'A row of tall gladiolus flower spikes growing in a modest American back garden in '
        'summer, drawn close and from slightly below so the spikes rise against a bright open '
        'sky. Sword-shaped upright leaves clearly drawn. Blooms stacked up each stem, warm '
        'coral and gold. A plain timber fence behind. Nobody in the picture. Vivid and alive.', '16:9'),

    'plate-gold-coins': (
        'A small loose pile of gold coins spilling across a dark plain surface, drawn close '
        'and straight on, lit from the upper left so the rims catch. The coin faces are '
        'entirely BLANK — smooth metal discs with a plain raised rim, no design, no lettering, '
        'no portrait, no numerals. Generous dark space around the pile.', '1:1'),

    'plate-parade': (
        'A small American city main street in 1925 during a modest civic parade: bunting '
        'strung across the street, an open motor car moving slowly, people lining both '
        'pavements waving, all figures small and distant. Every banner, flag and shopfront '
        'sign completely BLANK. Bright summer light, confetti in the air. Joyful and homemade.', '16:9'),

    # §07 — the patent attorney
    'plate-drafting-desk': (
        'A draughtsman\'s sloped desk under a single lamp, seen from above and behind an empty '
        'chair: technical drawing instruments, dividers, a scale rule, and large mechanical '
        'drawings pinned flat — the drawings show precise geometric machine parts and section '
        'lines but carry NO text, NO numerals, NO title blocks, NO labels. Everything else in '
        'shadow. Exacting and quiet.', '16:9'),

    'plate-old-man-hall': (
        'A large hall seen from the BACK of the room looking FORWARD towards a low stage at '
        'the far end. Rows of schoolchildren are seated in the hall with their BACKS to us, '
        'every one of them FACING FORWARD TOWARDS THE STAGE, as an audience does. Walking away '
        'from us down the centre aisle, SMALL and at a distance, is one elderly man in a long '
        'overcoat and hat with a walking stick, also seen from behind. He is modest in the '
        'frame — roughly a fifth of the picture height — not looming in the foreground. The '
        'stage at the far end is the brightest thing in the picture. High windows, cool light.', '16:9'),

    # §08 — cerise as a fashion word
    # First attempt came back as a near-empty pale field with one small washed-out figure at
    # the edge and no cerise in it at all. Rewritten to pin the crop, the scale and the colour.
    'plate-fashion-plate-cerise': (
        'A 1920s fashion illustration, CROPPED CLOSE and FILLING THE WHOLE FRAME: three '
        'elongated stylised female figures standing together, seen from the knees up, their '
        'drop-waist evening dresses drawn flat and graphic. The dresses are a VIVID, '
        'SATURATED CHERRY-PINK — strong hot pink, the single loudest colour in the picture, '
        'covering a large area of the image. Faces left as blank ovals with no features. '
        'Deep indigo ground behind them. The figures are LARGE and fill the frame edge to '
        'edge; no empty margins, no small figure lost in white space.', '16:9'),

    # §10 — albumen
    'plate-egg-albumen': (
        'A single hen\'s egg freshly cracked into a plain white shallow bowl on a scrubbed '
        'wooden table, drawn close and from above: the clear albumen spread around a domed '
        'yolk, two pieces of broken shell beside the bowl. Cool daylight from one side. '
        'Ordinary, domestic, and oddly beautiful. Nothing else in the picture.', '16:9'),

    # §11 — what the record does not hold
    'plate-four-chairs': (
        'Four plain wooden chairs standing in a row, well spaced, on a bare floor in a large '
        'empty room, seen straight on in flat even light. Nobody sitting in them. Long soft '
        'shadows stretching away. Quiet, formal, and unmistakably about absence.', '16:9'),

    'plate-attic-record': (
        'The corner of a dusty attic storeroom: stacked cardboard document boxes, a tied '
        'bundle of papers, an old trunk, one shaft of daylight from a small window falling '
        'across them. All papers and box faces completely BLANK. Everything softened by dust. '
        'Still, forgotten, and unread.', '16:9'),
    # ══════════════════════════════════════════════════════════════════════════════════
    # THIRD PASS — review notes on the v2 cut.
    # ══════════════════════════════════════════════════════════════════════════════════

    # §01 — the cold open. The wide theatre interior was handsome but empty, and the
    # narration is explicit: a girl on a stage in front of THOUSANDS. This is the shot the
    # opening needs, and it is taken from behind her so no face is invented.
    'plate-stage-over-shoulder': (
        'Seen from BEHIND and just over the shoulder of a young Black girl of about thirteen '
        'standing alone at the front of a theatre stage in 1908, facing out into an enormous '
        'packed auditorium. We see the back of her head, her plaited hair and her shoulders '
        'large in the near foreground, dark against the light — HER FACE IS COMPLETELY '
        'INVISIBLE because she is turned away from us. Beyond her, thousands of tiny distant '
        'people fill tier upon tier of seats and balconies rising into the dark, an immense '
        'crowd. A hard stage light falls on her from above. Vast, hushed, overwhelming.', '16:9'),

    # §04 — segregation. The two plain doors were too quiet to read; a partitioned streetcar
    # states it plainly, and states it with architecture rather than with a caption.
    'plate-segregation-streetcar': (
        'The inside of an American electric streetcar about 1908, seen down its length from '
        'one end. A plain wooden partition screen stands across the middle of the car dividing '
        'it in two. Passengers are seated on both sides of the screen, all of them seen from '
        'behind or in silhouette with no readable faces, and nobody crosses it. Cold daylight '
        'through the windows, worn cane seats, hand straps overhead. No signs, no lettering of '
        'any kind. Ordinary, everyday, and quietly wrong.', '16:9'),

    # §08 — "serious money for an ordinary family in 1926". The plate here was a motor car.
    'plate-family-1926': (
        'An ordinary modest American family of about 1926 standing together outside their '
        'small clapboard house: two parents and three children, plainly dressed, on a bare '
        'porch step. Every figure is seen from behind or in near silhouette against the light, '
        'with no readable faces. A washing line, a wooden fence, a plain yard. Flat afternoon '
        'light. Unglamorous, hardworking, and warm.', '16:9'),
    # 3:57 — "Calvin Coolidge shakes every one of their hands". A formal portrait print of
    # Coolidge did not read as that at all; the moment is the receiving line itself.
    'plate-handshake-line': (
        'A formal reception in a grand American hall in 1925: a tall adult man in a dark suit '
        'bends slightly to shake the hand of a child, while a neat line of eight or nine other '
        'children waits its turn behind. Every figure is seen from BEHIND or in near '
        'silhouette against tall bright windows, so no face is readable. Polished floor, '
        'columns, formal and slightly nervous. Warm light from the windows.', '16:9'),
}


def gen(slug, retries=4):
    prompt, aspect = SLOTS[slug]
    body = {'contents': [{'parts': [{'text': STYLE + prompt}]}],
            'generationConfig': {'responseModalities': ['IMAGE'],
                                 'imageConfig': {'aspectRatio': aspect, 'imageSize': '2K'}}}
    req = urllib.request.Request(
        f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent',
        data=json.dumps(body).encode(),
        headers={'Content-Type': 'application/json', 'X-goog-api-key': KEY})
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=300, context=CTX) as r:
                d = json.load(r)
            for p in d.get('candidates', [{}])[0].get('content', {}).get('parts', []):
                if 'inlineData' in p:
                    raw = base64.b64decode(p['inlineData']['data'])
                    open(f'{OUT}/{slug}.png', 'wb').write(raw)
                    return f'OK    {slug:26} {len(raw)//1024}KB'
            fr = d.get('candidates', [{}])[0].get('finishReason', '?')
            return f'NOIMG {slug:26} finish={fr}'
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 503) and attempt < retries - 1:
                time.sleep(20 * (attempt + 1)); continue
            return f'ERR   {slug:26} HTTP {e.code}'
        except Exception as e:
            if attempt < retries - 1: time.sleep(10); continue
            return f'ERR   {slug:26} {type(e).__name__}'
    return f'ERR   {slug:26} exhausted'


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('-')]
    if '--all' in sys.argv:
        args = [s for s in SLOTS if not os.path.exists(f'{OUT}/{s}.png')]
    if not args:
        for s in SLOTS:
            have = os.path.exists(f'{OUT}/{s}.png')
            print(f"  {'HAVE' if have else '    '}  {s}")
        sys.exit(0)
    with cf.ThreadPoolExecutor(max_workers=3) as ex:
        for r in ex.map(gen, args): print(r)
