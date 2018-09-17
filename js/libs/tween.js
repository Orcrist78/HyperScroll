/*!
  ISC License

  Copyright (c) 2018, Giuseppe Scotto Lavina

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted, provided that the above
  copyright notice and this permission notice appear in all copies.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
  OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
*/

const s = 1.70158;
export const EasingFunctions = {
  linear: t => t,
  easeInQuad: pos => Math.pow(pos,2),
  easeOutQuad: pos => -(Math.pow((pos-1),2)-1),
  easeInOutQuad: pos => (pos/=0.5)<1?0.5*Math.pow(pos,2):-0.5*((pos-=2)*pos-2),
  easeInCubic: pos => Math.pow(pos,3),
  easeOutCubic: pos => Math.pow((pos-1),3)+1,
  easeInOutCubic: pos => (pos/=0.5)<1?0.5*Math.pow(pos,3):0.5*(Math.pow((pos-2),3)+2),
  easeInQuart: pos => Math.pow(pos,4),
  easeOutQuart: pos => -(Math.pow((pos-1),4)-1),
  easeInOutQuart: pos => (pos/=0.5)<1?0.5*Math.pow(pos,4):-0.5*((pos-=2)*Math.pow(pos,3)-2),
  easeInQuint: pos => Math.pow(pos,5),
  easeOutQuint: pos => Math.pow((pos-1),5)+1,
  easeInOutQuint: pos => (pos/=0.5)<1?0.5*Math.pow(pos,5):0.5*(Math.pow((pos-2),5)+2),
  easeInSine: pos => -Math.cos(pos*(Math.PI/2))+1,
  easeOutSine: pos => Math.sin(pos*(Math.PI/2)),
  easeInOutSine: pos => -0.5*(Math.cos(Math.PI*pos)-1),
  easeInExpo: pos => pos===0?0:Math.pow(2,10*(pos-1)),
  easeOutExpo: pos => pos===1?1:-Math.pow(2,-10*pos)+1,
  easeInOutExpo: pos => {
    if(pos===0) return 0;
    if(pos===1) return 1;
    if((pos/=0.5)<1) return 0.5*Math.pow(2,10*(pos-1));
    return 0.5*(-Math.pow(2,-10*--pos)+2);
  },
  easeInCirc: pos => -(Math.sqrt(1-(pos*pos))-1),
  easeOutCirc: pos => Math.sqrt(1-Math.pow((pos-1),2)),
  easeInOutCirc: pos => (pos/=0.5)<1?-0.5*(Math.sqrt(1-pos*pos)-1):0.5*(Math.sqrt(1-(pos-=2)*pos)+1),
  easeOutBounce: pos => {
    if(pos<1/2.75){return(7.5625*pos*pos)}
    else if(pos<2/2.75){return(7.5625*(pos-=(1.5/2.75))*pos+0.75)}
    else if(pos<2.5/2.75){return(7.5625*(pos-=(2.25/2.75))*pos+0.9375)}
    else {return(7.5625*(pos-=(2.625/2.75))*pos + 0.984375)}
  },
  easeInBack: pos => pos*pos*((s+1)*pos-s),
  easeOutBack: pos => --pos*pos*((s+1)*pos+s)+1,
  easeInOutBack: pos => {
    let s = 1.70158;
    if((pos/=0.5)<1)return 0.5*(pos*pos*(((s*=(1.525))+1)*pos-s));
    return 0.5*((pos-=2)*pos*(((s*=(1.525))+1)*pos+s)+2);
  },
  elastic: pos => -1*Math.pow(4,-8*pos)*Math.sin((pos*6-1)*(2*Math.PI)/2)+1,
  swingFromTo: pos => {
    let s = 1.70158;
    return((pos/=0.5)<1)?0.5*(pos*pos*(((s*=(1.525))+1)*pos-s)):0.5*((pos-=2)*pos*(((s*=(1.525))+1)*pos+s)+2)
  },
  swingFrom: pos => pos*pos*((s+1)*pos-s),
  swingTo: pos => --pos*pos*((s+1)*pos + s)+1,
  bounce: pos => {
    if(pos<1/2.75){return(7.5625*pos*pos)}
    else if(pos<2/2.75){return(7.5625*(pos-=(1.5/2.75))*pos+0.75)}
    else if(pos<2.5/2.75){return(7.5625*(pos-=(2.25/2.75))*pos+0.9375)}
    else{return(7.5625*(pos-=(2.625/2.75))*pos+0.984375)}
  },
  bouncePast: pos => {
    if(pos<1/2.75){return(7.5625*pos*pos)}
    else if(pos<2/2.75){return(2-(7.5625*(pos-=(1.5/2.75))*pos+0.75))}
    else if(pos<2.5/2.75){return(2-(7.5625*(pos-=(2.25/2.75))*pos+0.9375))}
    else{return 2-(7.5625*(pos-=(2.625/2.75))*pos+0.984375)}
  },
  easeFromTo: pos => (pos/=0.5)<1?0.5*Math.pow(pos,4):-0.5*((pos-=2)*Math.pow(pos,3)-2),
  easeFrom: pos => Math.pow(pos,4),
  easeTo: pos => Math.pow(pos,0.25)
};

const queue = [];
const processTweens = now => {
  let i = queue.length;

  i && requestAnimationFrame(processTweens);

  while(i--) {
    const job = queue[i];
    const diff = now - job.startTime;
    const last = diff >= job.duration;
    const value = last ? job.end : job.start + (job.easing(diff / job.duration) * (job.end - job.start));

    job.fn(value, last);
    last && queue.splice(i, 1);
  }
  tween.onEnd && !queue.length && tween.onEnd();
  tween.onRender && tween.onRender(!queue.length);
};

export const tween = (start, end, duration, fn, easing) => {
  if(Number.isFinite(start) && Number.isFinite(end) && Number.isFinite(duration) && typeof fn === 'function') {
    if(duration && start !== end) {
      const loop = !!queue.length;

      queue.push({
        easing: EasingFunctions[EasingFunctions.hasOwnProperty(easing) ? easing : tween.easeDefault],
        startTime: performance.now(),
        duration: duration,
        start: start,
        end: end,
        fn: fn
      });
      loop || requestAnimationFrame(processTweens);
    } else
      fn(end);
  }
};

tween.onEnd = null;
tween.onRender = null;
tween.easeDefault = 'bounce';
