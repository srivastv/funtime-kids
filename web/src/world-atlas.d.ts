// world-atlas ships TopoJSON as .json. Declare it as `any` so tsc doesn't try to
// infer a giant literal type from the coordinate arrays.
declare module 'world-atlas/countries-110m.json' {
  const value: unknown
  export default value
}
