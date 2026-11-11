#!/usr/bin/env python3
"""Cut the scene recordings against the narration and write <id>.mp4, <id>.vtt, posters and the transcript.

usage: assemble.py <take dir> <film spec json> <out dir>
spec: {"id": "overview", "voice": "en-GB-RyanNeural", "segments": [
         {"scene": "02-define", "from": "loaded+0.5", "to": "typed", "len": 6, "text": "narration ...", "hold": 0.4}, ...]}
A mark is "<name>[@k][+/-seconds]" from <scene>.marks.json (k = the k-th occurrence, 1-based) or a plain number of seconds.
Each segment lasts max(video length after speed, narration length + hold); the video is frozen on its last frame to fill,
the narration padded with silence. Segments without text are silent."""
import json, subprocess, sys, os, re, shutil, hashlib

take, spec_path, out = sys.argv[1:4]
spec = json.load(open(spec_path))
fid, voice = spec['id'], spec.get('voice', 'en-GB-RyanNeural')
work = os.path.join(out, 'work', fid); os.makedirs(work, exist_ok=True)
EDGE = os.path.expanduser('~/.local/bin/edge-tts')

def run(*cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: raise SystemExit(f"failed: {' '.join(cmd)}\n{r.stderr[-2000:]}")
    return r.stdout

def dur(path):
    return float(run('ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path).strip())

def mark(scene, ref):
    if isinstance(ref, (int, float)): return float(ref)
    m = re.fullmatch(r'(.*?)(?:@(\d+))?([+-]\d+(?:\.\d+)?)?', ref.strip())
    if not m or not m.group(1): raise SystemExit(f'bad mark {ref!r}')
    name, k, off = m.group(1).strip(), int(m.group(2) or 1), float(m.group(3) or 0)
    marks = json.load(open(os.path.join(take, f'{scene}.marks.json')))
    hits = [t for n, t in marks if n == name or n.split(' ')[0] == name]
    if len(hits) < k: raise SystemExit(f'mark {ref!r} not in {scene}: {[n for n, _ in marks]}')
    return hits[k - 1] + off

def vo(text, key):
    """the narration clip for one segment: mp3 + srt from edge-tts, cached by text"""
    h = hashlib.sha1((voice + text).encode()).hexdigest()[:12]
    mp3, srt = os.path.join(work, f'vo-{h}.mp3'), os.path.join(work, f'vo-{h}.srt')
    if not os.path.exists(mp3):
        run(EDGE, '--voice', voice, '--rate=' + spec.get('rate', '-4%'), '--text', text, '--write-media', mp3, '--write-subtitles', srt)
    return mp3, srt

def srt_cues(path):
    cues = []
    for block in open(path, encoding='utf-8').read().strip().split('\n\n'):
        lines = block.strip().split('\n')
        if len(lines) < 3: continue
        a, b = lines[1].split(' --> ')
        tosec = lambda s: sum(float(x) * m for x, m in zip(s.replace(',', '.').split(':'), (3600, 60, 1)))
        cues.append((tosec(a), tosec(b), ' '.join(lines[2:])))
    return cues

segs, t = [], 0.0
for i, s in enumerate(spec['segments']):
    scene = s['scene']; src = os.path.join(take, f'{scene}.webm')
    a, b = mark(scene, s['from']), mark(scene, s['to'])
    hold = float(s.get('hold', 0.5))
    speed = float(s.get('speed', 1))
    if s.get('len'): speed = max(speed, (b - a) / float(s['len']))   # len = the seconds this stretch of video should take on screen
    vlen = (b - a) / speed
    text = s.get('text', '').strip()
    alen, mp3, cues = 0.0, None, []
    if text:
        mp3, srt = vo(text, i); alen = dur(mp3); cues = srt_cues(srt)
    lead = float(s.get('lead', 0.0))   # narration starts this long after the segment begins
    target = max(vlen, lead + alen + hold, float(s.get('min', 0)))
    pad = max(0.0, target - vlen)
    vseg = os.path.join(work, f'v{i:02d}.mp4')
    vf = f'setpts=PTS/{speed},fps=24,scale=1280:800:flags=lanczos'
    for box in s.get('cover', []):   # a filled box over a region of the panel (a redaction in the panel's own colour): [x, y, w, h, colour?]
        x, y, w, h = box[:4]; colour = box[4] if len(box) > 4 else spec.get('panel', 'EBE7DE')
        vf += f',drawbox=x={x}:y={y}:w={w}:h={h}:color=0x{colour}@1:t=fill'
    if pad > 0: vf += f',tpad=stop_mode=clone:stop_duration={pad:.3f}'
    run('ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-i', src,
        '-filter:v', vf, '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-t', f'{target:.3f}', vseg)
    vlen_real = dur(vseg)
    aseg = os.path.join(work, f'a{i:02d}.m4a')
    if mp3:
        run('ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', mp3, '-af', f'adelay={int(lead*1000)}|{int(lead*1000)},apad=whole_dur={vlen_real:.3f}',
            '-t', f'{vlen_real:.3f}', '-ar', '48000', '-ac', '2', '-c:a', 'aac', '-b:a', '128k', aseg)
    else:
        run('ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-t', f'{vlen_real:.3f}', '-c:a', 'aac', '-b:a', '128k', aseg)
    segs.append({'v': vseg, 'a': aseg, 'start': t, 'len': vlen_real, 'text': text, 'cues': [(t + lead + c0, t + lead + c1, tx) for c0, c1, tx in cues], 'scene': scene})
    print(f'{fid} seg {i:02d} {scene:12s} video {vlen:6.2f}s x{speed:g}  narration {alen:5.2f}s  -> {vlen_real:6.2f}s  at {t:6.2f}s')
    t += vlen_real

for kind in ('v', 'a'):
    lst = os.path.join(work, f'{kind}list.txt')
    open(lst, 'w').write(''.join(f"file '{os.path.abspath(s[kind])}'\n" for s in segs))
    run('ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', os.path.join(work, f'all-{kind}.{"mp4" if kind == "v" else "m4a"}'))
final = os.path.join(out, f'{fid}.mp4')
run('ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', os.path.join(work, 'all-v.mp4'), '-i', os.path.join(work, 'all-a.m4a'),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', str(spec.get('crf', 27)), '-maxrate', spec.get('maxrate', '1500k'), '-bufsize', '3000k', '-pix_fmt', 'yuv420p',
    '-c:a', 'copy', '-movflags', '+faststart', final)   # the web size: the stage is dense, so the rate is capped
total = dur(final)

def ts(x):
    m, s = divmod(x, 60); return f'{int(m):02d}:{s:06.3f}'
vtt = ['WEBVTT', '']
transcript = []
for s in segs:
    if not s['cues']: continue
    # one cue per narration sentence group, merged so no cue is shorter than 1.2 s
    merged = []
    for c0, c1, tx in s['cues']:
        if merged and c0 - merged[-1][0] < 1.2: merged[-1] = (merged[-1][0], c1, merged[-1][2] + ' ' + tx)
        else: merged.append((c0, c1, tx))
    for j, (c0, c1, tx) in enumerate(merged):
        end = max(c1, c0 + 1.0)
        if j + 1 < len(merged): end = min(end, merged[j + 1][0] - 0.05)
        vtt += [f'{ts(c0)} --> {ts(end)}', tx, '']
    transcript.append([ts(s['start'] + 0.0)[:5], s['text']])
open(os.path.join(out, f'{fid}.vtt'), 'w', encoding='utf-8').write('\n'.join(vtt))
json.dump({'id': fid, 'duration': round(total, 3), 'transcript': transcript}, open(os.path.join(out, f'{fid}.json'), 'w'), indent=1)
poster_at = float(spec.get('poster_at', min(total - 1, 8.0)))
run('ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-ss', f'{poster_at:.3f}', '-i', final, '-frames:v', '1', '-q:v', '2', os.path.join(out, f'{fid}-poster.jpg'))
run('ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-ss', f'{poster_at:.3f}', '-i', final, '-frames:v', '1', '-quality', '88', os.path.join(out, f'{fid}-poster.webp'))
print(f'{fid}: {total:.2f}s  {os.path.getsize(final)/1e6:.1f} MB  cues {sum(1 for l in vtt if "-->" in l)}')
