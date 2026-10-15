"""Original procedural media. Requires Pillow and imageio-ffmpeg (generation only)."""
from PIL import Image, ImageDraw
import math, wave, struct, subprocess
from pathlib import Path
import imageio_ffmpeg
ROOT=Path(__file__).parent

def frame(t, mode):
    im=Image.new('RGB',(480,320),'#132441' if mode==0 else '#30234c'); d=ImageDraw.Draw(im)
    for i in range(30):
        x=(i*97)%480; y=(i*53)%240
        d.ellipse((x,y,x+2,y+2),fill='#fcdfa0')
    if mode==0:
        d.ellipse((300,25,395,120),fill='#ffe0a3')
        for i in range(5):
            x=int((t*65+i*115)%650)-85; y=int(175+35*math.sin(t*2+i))
            d.ellipse((x,y,x+65,y+32),fill=['#ffb46b','#63daca','#e5a3ef'][i%3])
            d.polygon([(x,y+16),(x-19,y),(x-19,y+32)],fill='#63daca')
            d.ellipse((x+48,y+9,x+53,y+14),fill='#132441')
        d.text((18,290),'MOONFISH / a midnight migration',fill='white')
    else:
        for i in range(8):
            a=t+i*math.tau/8; x=240+math.cos(a)*110; y=150+math.sin(a*2)*65
            d.ellipse((x-22,y-22,x+22,y+22),fill=['#ffc66d','#ed89b5','#79ded0'][i%3])
            d.ellipse((x-8,y-5,x-4,y-1),fill='#30234c'); d.ellipse((x+4,y-5,x+8,y-1),fill='#30234c')
            d.arc((x-8,y-2,x+8,y+10),0,180,fill='#30234c',width=2)
        d.text((18,290),'ORBIT CLUB / tiny planets, big feelings',fill='white')
    return im
for mode,name in enumerate(['moonfish','orbit-club']):
    frame(0,mode).save(ROOT/(name+'.png'))
    frames=[frame(i/10,mode) for i in range(40)]
    if mode==0: frames[0].save(ROOT/'moonfish.gif',save_all=True,append_images=frames[1:],duration=100,loop=0)
    proc=subprocess.Popen([imageio_ffmpeg.get_ffmpeg_exe(),'-y','-f','rawvideo','-vcodec','rawvideo','-s','480x320','-pix_fmt','rgb24','-r','20','-i','-','-an','-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart',str(ROOT/(name+'.mp4'))],stdin=subprocess.PIPE,stderr=subprocess.DEVNULL)
    for i in range(120): proc.stdin.write(frame(i/20,mode).tobytes())
    proc.stdin.close()
    if proc.wait(): raise RuntimeError('Video encoding failed')
for k,name in enumerate(['bubble-waltz','starlight-steps']):
    rate=22050; notes=([261.63,329.63,392,523.25,392,329.63] if k==0 else [220,277.18,329.63,440,369.99,277.18])
    with wave.open(str(ROOT/(name+'.wav')),'wb') as w:
        w.setparams((1,2,rate,0,'NONE','not compressed'))
        data=bytearray()
        for n in range(rate*12):
            t=n/rate; beat=t%0.5; f=notes[int(t/0.5)%len(notes)]
            env=math.sin(math.pi*min(beat/.5,1))**2
            fade=min(t,1,12-t)
            v=.23*env*(math.sin(math.tau*f*t)+.25*math.sin(math.tau*f*2*t))+.08*math.sin(math.tau*(130.815 if k==0 else 110)*t)
            data.extend(struct.pack('<h',int(32767*v*fade)))
        w.writeframes(data)
