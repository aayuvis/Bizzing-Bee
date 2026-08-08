import subprocess, sys, os, json
S='/tmp/claude-0/-home-user-Bizzing-Bee/4e23cfba-e7d7-5db3-a77c-4dd0a1079ba5'
def run(frag_in, out_frag, out_full, title):
    js = f'''
const {{chromium}} = require('playwright');
(async () => {{
  const b = await chromium.launch({{executablePath:'/opt/pw-browsers/chromium'}});
  const p = await b.newPage({{viewport:{{width:1280,height:900}}}});
  await p.goto('file://{S}/{frag_in}');
  await p.waitForTimeout(2500);
  // strip the image blob: srcs are now inline in the markup, so it would double the file
  await p.evaluate(() => {{
    document.querySelectorAll('script').forEach(s => {{
      if (s.textContent.startsWith('window.__IMG__')) s.remove();
    }});
    document.body.setAttribute('data-prerendered','');
  }});
  const html = await p.evaluate(() => document.body.innerHTML);
  const head = await p.evaluate(() => [...document.querySelectorAll('style')].map(s=>s.outerHTML).join('\\n'));
  require('fs').writeFileSync('{S}/.pre.json', JSON.stringify({{html, head}}));
  await b.close();
}})();
'''
    open(f'{S}/.pre.js','w').write(js)
    subprocess.run(['node', f'{S}/.pre.js'], cwd=S, check=True)
    d = json.load(open(f'{S}/.pre.json'))
    frag = d['head'] + '\n' + d['html']
    open(f'{S}/{out_frag}','w',encoding='utf-8').write(f'<title>{title}</title>\n' + frag)
    full = ('<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            f'<title>{title}</title>\n{d["head"]}\n</head>\n<body data-prerendered>\n{d["html"]}\n</body>\n</html>\n')
    open(f'{S}/{out_full}','w',encoding='utf-8').write(full)
    print(out_full, round(len(full)/1048576,2), 'MB')

if __name__ == '__main__':
    run(*sys.argv[1:])
