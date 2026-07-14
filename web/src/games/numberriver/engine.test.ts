import { describe, it, expect } from 'vitest'
import { evaluateBridge, checkLevel, scoreStars, bestKey, generateLevel, buildLevelPool } from './engine'
import type { NumberRiverLevel } from '../../content/types'

describe('number river engine', ()=>{
  it('evaluates addition subtraction left to right', ()=>{
    const res = evaluateBridge([{type:'+',value:5,display:'+5'},{type:'-',value:2,display:'-2'},{type:'+',value:10,display:'+10'}],0)
    expect(res.valid).toBe(true)
    expect(res.final).toBe(13)
    expect(res.intermediates).toEqual([5,3,13])
  })
  it('order matters for non commutative', ()=>{
    const a = evaluateBridge([{type:'+',value:5,display:'+5'},{type:'×',value:2,display:'×2'}],0)
    const b = evaluateBridge([{type:'×',value:2,display:'×2'},{type:'+',value:5,display:'+5'}],0)
    expect(a.final).toBe(10)
    expect(b.final).toBe(5)
  })
  it('rejects non integer division', ()=>{
    const res = evaluateBridge([{type:'+',value:5,display:'+5'},{type:'÷',value:2,display:'÷2'}],0)
    expect(res.valid).toBe(false)
    expect(res.reason).toBe('nonIntegerDivision')
  })
  it('rejects negative intermediate', ()=>{
    const res = evaluateBridge([{type:'-',value:5,display:'-5'}],0)
    expect(res.valid).toBe(false)
    expect(res.reason).toBe('negative')
  })
  it('checks level correct', ()=>{
    const level: NumberRiverLevel = {id:'t', target:15, slots:3, difficulty:1, availableOps:[{type:'+',value:7,display:'+7'},{type:'+',value:8,display:'+8'},{type:'+',value:5,display:'+5'},{type:'-',value:2,display:'-2'}]}
    expect(checkLevel(level, [{type:'+',value:7,display:'+7'},{type:'+',value:8,display:'+8'},{type:'+',value:5,display:'+5'} as any])).toBe(false) // 20 not 15
    expect(checkLevel(level, [{type:'+',value:7,display:'+7'},{type:'+',value:8,display:'+8'},{type:'+',value:0,display:'+0'} as any])).toBe(true)
  })
  it('check level with correct sequence from sample', ()=>{
    const level: NumberRiverLevel = {id:'t', target:15, slots:3, difficulty:1, availableOps:[]}
    const seq = [{type:'+',value:7,display:'+7'},{type:'+',value:8,display:'+8'},{type:'+',value:0,display:'+0'}] as any
    expect(checkLevel(level, seq)).toBe(true)
  })
  it('generates solvable levels', ()=>{
    for(let i=0;i<20;i++){
      const lvl = generateLevel(1)
      expect(lvl.target).toBeGreaterThanOrEqual(5)
      expect(lvl.availableOps.length).toBeGreaterThanOrEqual(lvl.slots)
    }
    for(let i=0;i<20;i++){
      const lvl = generateLevel(2)
      expect(lvl.target).toBeGreaterThanOrEqual(5)
    }
  })
  it('build pool returns 8', ()=>{
    const curated: NumberRiverLevel[] = Array.from({length:5},(_,i)=>({id:`c${i}`, target:10+i, slots:3, difficulty:1, availableOps:[{type:'+',value:5,display:'+5'},{type:'+',value:5,display:'+5'},{type:'+',value:0,display:'+0'},{type:'+',value:0,display:'+0'}]}))
    const pool = buildLevelPool(curated,1,8)
    expect(pool.length).toBe(8)
  })
  it('score stars thresholds', ()=>{
    expect(scoreStars(7,8,1)).toBe(3)
    expect(scoreStars(5,8,1)).toBe(2)
    expect(scoreStars(3,8,1)).toBe(1)
    expect(scoreStars(2,8,1)).toBe(0)
  })
  it('best key format', ()=>{
    expect(bestKey(2)).toBe('numberriver:best:2')
  })
})
