#!/usr/bin/env python3
"""Kokoro narration: say.py <voice> <speed> <text file> <out.wav> <out.srt>  (British English pipeline, word timestamps -> srt cues per sentence)"""
import sys, re, json, numpy as np, soundfile as sf, warnings
warnings.filterwarnings('ignore')
voice, speed, textf, wav, srt = sys.argv[1], float(sys.argv[2]), sys.argv[3], sys.argv[4], sys.argv[5]
from kokoro import KPipeline
p = KPipeline(lang_code='b', repo_id='hexgrad/Kokoro-82M', device='cpu')
text = open(textf, encoding='utf-8').read().strip()
audio, cues, t = [], [], 0.0
GAP = 0.25   # seconds of air between the pieces the pipeline splits on
for r in p(text, voice=voice, speed=speed, split_pattern=r'\n+'):
    a = r.audio.numpy() if hasattr(r.audio, 'numpy') else np.asarray(r.audio)
    words = [(tk.text + (tk.whitespace or ''), tk.start_ts, tk.end_ts) for tk in (r.tokens or []) if tk.start_ts is not None and tk.end_ts is not None and tk.text.strip()]
    # cues: split the piece at sentence ends, each cue = its words' span
    cur, start = [], None
    for w, s0, s1 in words:
        if start is None: start = s0
        cur.append(w)
        if re.search(r'[.!?:]\s*$', w) or len(''.join(cur)) > 70:
            cues.append((t + start, t + s1, ''.join(cur).strip())); cur, start = [], None
    if cur: cues.append((t + start, t + words[-1][2], ''.join(cur).strip()))
    audio.append(a); audio.append(np.zeros(int(24000 * GAP), dtype=a.dtype)); t += len(a) / 24000 + GAP
out = np.concatenate(audio)[:-int(24000 * GAP)] if audio else np.zeros(1)
sf.write(wav, out, 24000)
def ts(x):
    h, m = divmod(x, 3600); m, s = divmod(m, 60); return f'{int(h):02d}:{int(m):02d}:{s:06.3f}'.replace('.', ',')
open(srt, 'w', encoding='utf-8').write(''.join(f'{i+1}\n{ts(a)} --> {ts(b)}\n{tx}\n\n' for i, (a, b, tx) in enumerate(cues)))
print(f'{len(out)/24000:.2f}s {len(cues)} cues')
