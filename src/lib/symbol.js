// Market symbols look like "BTC/INR". Slashes are awkward in a route
// segment, so URLs use "BTC-INR" and we convert back at the API boundary.

export const symbolToPath = (symbol) => symbol.replace('/', '-')
export const pathToSymbol = (path) => path.replace('-', '/')