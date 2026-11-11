#!/usr/bin/env python3
"""Write each film's measured duration and narration transcript (from assemble.py's <film>.json)
into site/src/data/films.ts. usage: fill-films.py <films dir>"""
import json, os, re, sys

films_dir = sys.argv[1]
path = os.path.join(os.path.dirname(__file__), '..', '..', 'site', 'src', 'data', 'films.ts')
src = open(path, encoding='utf-8').read()
for fid in ('overview', 'cortex', 'neuron'):
    meta = json.load(open(os.path.join(films_dir, f'{fid}.json')))
    seconds = int(round(meta['duration']))
    block_start = src.index(f'  {fid}: {{')
    block_end = src.index('\n  },', block_start)
    block = src[block_start:block_end]
    block = re.sub(r'duration: \d+,', f'duration: {seconds},', block, count=1)
    if 'transcript:' in block:
        lines = ',\n'.join(
            f"      ['{t}', {json.dumps(line, ensure_ascii=False).replace(chr(39), chr(8217))}]".replace('"', "'")
            if "'" not in line else f"      ['{t}', {json.dumps(line, ensure_ascii=False)}]"
            for t, line in meta['transcript'])
        block = re.sub(r'transcript: \[[\s\S]*$', f'transcript: [\n{lines},\n    ] as [string, string][]', block)
    src = src[:block_start] + block + src[block_end:]
    print(f'{fid}: {seconds}s, {len(meta["transcript"])} transcript lines')
open(path, 'w', encoding='utf-8').write(src)
