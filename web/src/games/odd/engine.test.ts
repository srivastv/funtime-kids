import { describe, it, expect } from 'vitest'
import { buildExperimentPool, checkAnswer, scoreStars, bestKey, filterPool } from './engine'
import type { OddExperiment } from '../../content/types'

const sample: OddExperiment[] = [
  { id:'p1', topic:'plants', title:'t', prompt:'q?', type:'predict-choice', difficulty:1, config:{options:['a','b'], correctIndex:0}, explanation:'e', funFact:'f' },
  { id:'p2', topic:'plants', title:'t', prompt:'q?', type:'predict-choice', difficulty:1, config:{options:['a','b'], correctIndex:1}, explanation:'e', funFact:'f' },
  { id:'p3', topic:'plants', title:'t', prompt:'q?', type:'predict-choice', difficulty:1, config:{options:['a','b'], correctIndex:0}, explanation:'e', funFact:'f' },
  { id:'p4', topic:'plants', title:'t', prompt:'q?', type:'predict-choice', difficulty:1, config:{options:['a','b'], correctIndex:0}, explanation:'e', funFact:'f' },
  { id:'b1', topic:'light-sound', title:'t', prompt:'q?', type:'drag-sort', difficulty:2, config:{ categories:['A','B'], items:[{label:'x',category:'A'},{label:'y',category:'B'}] }, explanation:'e', funFact:'f' },
  { id:'b2', topic:'light-sound', title:'t', prompt:'q?', type:'drag-sort', difficulty:2, config:{ categories:['A','B'], items:[{label:'x',category:'A'}] }, explanation:'e', funFact:'f' },
  { id:'b3', topic:'light-sound', title:'t', prompt:'q?', type:'drag-sort', difficulty:2, config:{ categories:['A','B'], items:[{label:'x',category:'A'}] }, explanation:'e', funFact:'f' },
  { id:'b4', topic:'light-sound', title:'t', prompt:'q?', type:'drag-sort', difficulty:2, config:{ categories:['A','B'], items:[{label:'x',category:'A'}] }, explanation:'e', funFact:'f' },
  { id:'r1', topic:'rocks', title:'t', prompt:'q?', type:'slider-predict', difficulty:1, config:{min:0,max:10,correctValue:5,tolerance:1}, explanation:'e', funFact:'f' },
  { id:'r2', topic:'rocks', title:'t', prompt:'q?', type:'slider-predict', difficulty:1, config:{min:0,max:10,correctValue:5,tolerance:1}, explanation:'e', funFact:'f' },
  { id:'r3', topic:'rocks', title:'t', prompt:'q?', type:'slider-predict', difficulty:3, config:{min:0,max:10,correctValue:5,tolerance:1}, explanation:'e', funFact:'f' },
  { id:'r4', topic:'rocks', title:'t', prompt:'q?', type:'slider-predict', difficulty:3, config:{min:0,max:10,correctValue:5,tolerance:1}, explanation:'e', funFact:'f' },
]

describe('odd engine', ()=>{
  it('filters by mode and difficulty', ()=>{
    const plants = filterPool(sample,'plants',1)
    expect(plants.every(p=>p.topic==='plants' && p.difficulty<=1)).toBe(true)
    const mixed = filterPool(sample,'mixed',2)
    expect(mixed.length).toBeGreaterThan(0)
    expect(mixed.every(p=>p.difficulty<=2)).toBe(true)
  })
  it('builds pool of 8', ()=>{
    const pool = buildExperimentPool(sample,'mixed',3)
    expect(pool.length).toBe(8)
  })
  it('checks predict-choice', ()=>{
    const exp = sample[0]
    expect(checkAnswer(exp,0)).toBe(true)
    expect(checkAnswer(exp,1)).toBe(false)
  })
  it('checks slider with tolerance', ()=>{
    const exp = sample[8]
    expect(checkAnswer(exp,5)).toBe(true)
    expect(checkAnswer(exp,6)).toBe(true)
    expect(checkAnswer(exp,7)).toBe(false)
  })
  it('checks drag-sort', ()=>{
    const exp = sample[4]
    expect(checkAnswer(exp,{x:'A',y:'B'})).toBe(true)
    expect(checkAnswer(exp,{x:'B',y:'B'})).toBe(false)
  })
  it('score stars thresholds', ()=>{
    expect(scoreStars(7,8)).toBe(3)
    expect(scoreStars(5,8)).toBe(2)
    expect(scoreStars(3,8)).toBe(1)
    expect(scoreStars(2,8)).toBe(0)
  })
  it('best key', ()=>{
    expect(bestKey('plants',2)).toBe('odd:plants:2')
  })
})
