type Props = { state: 'idle'|'walking'|'dance'|'splash'|'swim', progress?: number }

export default function Beaver({state, progress=0}:Props){
  let emoji='🦫'
  let extra=''
  let style: React.CSSProperties = {}
  if(state==='walking'){
    emoji='🦫'
    extra='animate-bounce'
    style={ transform:`translateX(${progress*100}%)` }
  } else if(state==='dance'){
    emoji='🦫'
    extra='animate-spin'
    style={ transform:'scale(1.3)' }
  } else if(state==='splash'){
    emoji='💦'
    extra=''
    style={ transform:'translateY(30px) rotate(180deg)', transition:'transform 0.6s ease-in' }
  } else if(state==='swim'){
    emoji='🦫'
    extra='animate-bounce'
    style={ transform:`translateX(${100-progress*100}%) scaleX(-1)` }
  }
  return <div className={`text-6xl transition-all duration-300 select-none ${extra}`} style={style}>{emoji}</div>
}
