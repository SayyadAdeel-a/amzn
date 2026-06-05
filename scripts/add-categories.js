const fs = require('fs');
const path = require('path');

const productsDir = path.join(__dirname, '../content/products');
const files = fs.readdirSync(productsDir).filter(f => f.endsWith('.json'));

const keywordToCategory = {
  'jersey': 'Jerseys',
  'kit': 'Jerseys',
  'sneaker': 'Sneakers',
  'shoe': 'Sneakers',
  'dunk': 'Sneakers',
  'jordan': 'Sneakers',
  'cleat': 'Sneakers',
  'boot': 'Sneakers',
  'hoodie': 'Streetwear',
  'jacket': 'Streetwear',
  'pant': 'Streetwear',
  'tee': 'Streetwear',
  'cap': 'Accessories',
  'hat': 'Accessories',
  'ball': 'Accessories',
  'bag': 'Accessories'
};

function determineCategory(name) {
  const lowerName = name.toLowerCase();
  for (const [key, category] of Object.entries(keywordToCategory)) {
    if (lowerName.includes(key)) {
      return category;
    }
  }
  return 'Accessories'; // Default fallback
}

files.forEach(file => {
  const filePath = path.join(productsDir, file);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  if (!content.category) {
    content.category = determineCategory(content.name);
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    console.log(`Added category '${content.category}' to ${file}`);
  }
});

console.log('Categories migration complete.');
