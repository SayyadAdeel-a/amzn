const fs = require('fs');
const products = [
  {id: 1, name: 'adidas Unisex-Adult Copa Pure IV Club Firm Ground/Multi Ground', image: 'https://m.media-amazon.com/images/I/61bzgmdMhXL._AC_SY695_.jpg', amazonUrl: 'https://amzn.to/4o59rOa', isActive: true},
  {id: 2, name: 'adidas Unisex Adult Samba Indoor Shoe', image: 'https://m.media-amazon.com/images/I/716XjP47jKL._AC_SY625_.jpg', amazonUrl: 'https://amzn.to/43j9pc7', isActive: true},
  {id: 3, name: 'adidas Womens House of Tiro Skirt', image: 'https://m.media-amazon.com/images/I/71LvAMLt2tL._AC_SX679_.jpg', amazonUrl: 'https://amzn.to/4ukago7', isActive: true},
  {id: 4, name: "adidas Men's Germany World Cup 2026 Apparel", image: 'https://m.media-amazon.com/images/I/61j65nxF48L._AC_SX679_.jpg', amazonUrl: 'https://amzn.to/4avJ923', isActive: true},
  {id: 5, name: "adidas Men's Germany 26 Home Replica Jersey", image: 'https://m.media-amazon.com/images/I/71qnp9MRN7L._AC_SX679_.jpg', amazonUrl: 'https://amzn.to/49Fxgq4', isActive: true},
  {id: 6, name: 'Kids Soccer Jersey for Boys&Girls, Youth Training Jerseys Sports Fan Jerseys Football Shirt for Children', image: 'https://m.media-amazon.com/images/I/61Gkm7FgoLL._AC_SX679_.jpg', amazonUrl: 'https://amzn.to/3RMVSXQ', isActive: true},
  {id: 7, name: 'Soccer Jerseys for Kids Boys & Girls, Youth Soccer Jersey Practice Outfits Football Training Uniforms Set 4-16Y', image: 'https://m.media-amazon.com/images/I/61nQSRh6XDL._AC_SX679_.jpg', amazonUrl: 'https://amzn.to/4vxnT4k', isActive: true},
  {id: 8, name: 'FIFA World Cup 2026 Baseball Cap, Cotton Adjustable Soccer Fan Hat, Football Sports Cap for Men Women Outdoor Travel', image: 'https://m.media-amazon.com/images/I/61fYMKLwwwL._AC_SX679_.jpg', amazonUrl: 'https://amzn.to/3PEoHoM', isActive: true},
  {id: 9, name: 'Outerstuff FIFA World Cup 2026 Pro Crown Snapback Embroidered Baseball Hat', image: 'https://m.media-amazon.com/images/I/81pHD4xgaTL._AC_SX679_.jpg', amazonUrl: 'https://amzn.to/4dPjPWZ', isActive: true},
  {id: 10, name: 'Outerstuff FIFA World Cup 2026 Mens Short Sleeve Sublimated Soccer Fashion Top', image: 'https://m.media-amazon.com/images/I/71Hw9YaLOTL._AC_SX679_.jpg', amazonUrl: 'https://amzn.to/43Pu4og', isActive: true},
  {id: 11, name: "Komorebi Women's Tennis Skirt - High Waisted Pleated Golf Skorts with Pockets - Athletic Workout Skirt", image: 'https://m.media-amazon.com/images/I/61sEPdmmTqL._AC_SY741_.jpg', amazonUrl: 'https://amzn.to/3S1Vy7y', isActive: true}
];

if (!fs.existsSync('content/products')) {
  fs.mkdirSync('content/products', { recursive: true });
}

products.forEach(p => {
  fs.writeFileSync(`content/products/${p.id}.json`, JSON.stringify({...p, id: p.id.toString()}, null, 2));
});
console.log('Done migrating');
