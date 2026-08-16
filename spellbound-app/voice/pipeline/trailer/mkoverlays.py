#!/usr/bin/env python3
"""Lower-third / title overlay PNGs (1920x1080, transparent) in the app's own Fraunces."""
from PIL import Image, ImageDraw, ImageFont

W,H = 1920,1080
FR = '/tmp/vid/fraunces800.ttf'
FD = '/tmp/vid/fredoka600.ttf'
HONEY=(255,216,115,255); WHITE=(255,255,255,255); INK=(20,14,40,255)

def text_img(name, main, sub=None, y=0.80, size=86, subsize=40, accent=None):
    im = Image.new('RGBA',(W,H),(0,0,0,0)); d = ImageDraw.Draw(im)
    f = ImageFont.truetype(FR,size); fs = ImageFont.truetype(FD,subsize)
    def draw_center(txt, font, cy, fill):
        # soft shadow pass then fill; accent word (UPPER in *stars*) drawn in honey
        bbox = d.textbbox((0,0),txt,font=font); tw = bbox[2]-bbox[0]
        x = (W-tw)/2
        for ox,oy in [(-3,3),(3,3),(0,4),(0,0)]:
            pass
        # shadow
        d.text((x+4, cy+5), txt, font=font, fill=(10,6,24,190))
        d.text((x, cy), txt, font=font, fill=fill)
    my = int(H*y)
    if accent:  # main split as pre|accent|post → accent in honey
        pre,acc,post = accent
        fpre = ImageFont.truetype(FR,size)
        wpre = d.textbbox((0,0),pre,font=fpre)[2]; wacc = d.textbbox((0,0),acc,font=fpre)[2]
        wpost= d.textbbox((0,0),post,font=fpre)[2]
        x0=(W-(wpre+wacc+wpost))/2
        for t_,fill,xx in [(pre,WHITE,x0),(acc,HONEY,x0+wpre),(post,WHITE,x0+wpre+wacc)]:
            d.text((xx+4,my+5),t_,font=fpre,fill=(10,6,24,190))
            d.text((xx,my),t_,font=fpre,fill=fill)
    else:
        draw_center(main, f, my, WHITE)
    if sub:
        sb = d.textbbox((0,0),sub,font=fs); sw=sb[2]-sb[0]
        d.text(((W-sw)/2+3, my+size+26+4), sub, font=fs, fill=(10,6,24,170))
        d.text(((W-sw)/2, my+size+26), sub, font=fs, fill=(255,255,255,225))
    im.save(f'/tmp/vid/ov_{name}.png')
    print('ov_'+name)

# S1 hook — big, higher on screen, two beats
text_img('hook1', 'A REAL KART RACER', y=0.40, size=110)
text_img('hook2', '', y=0.40, size=110, accent=('POWERED BY ','SPELLING',''))
# S2 menu
text_img('menu', 'Pick your hero · your kart · your world', y=0.055, size=64)
# S3 race
text_img('race', 'Race rivals · dodge hazards', y=0.80, size=76)
# S4 spell gate
text_img('spell1', 'Spell the word you hear…', y=0.06, size=68)
text_img('spell2', '', y=0.75, size=92, accent=('UNLOCK A ','ROCKET BOOST','!'))
# S5 worlds
text_img('worlds', '3 painted worlds · 5 karts', y=0.80, size=76)
# S6 finish
text_img('finish', '', y=0.78, size=76, accent=('Every win = ','words mastered',''))
# S7 app
text_img('app1', '8 spelling arcade games', y=0.80, size=76)
text_img('app2', '…and a full Mock Spelling Bee', sub='No ads · COPPA-safe · works offline', y=0.74, size=68)
