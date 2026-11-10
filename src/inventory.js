// One record represents one product style; every image belongs to its gallery.
export const uploadedProducts = [{
  style: 'Rio',
  legacyStyle: 'MH0001',
  category: 'OUTDOOR',
  gender: 'Men',
  subcategory: 'Hardshell Jackets',
  title: "Rio Men's Hooded Jacket",
  description: 'A men’s hooded outdoor jacket, photographed in black, blue and grey colourways. Discuss your material, sizing and OEM / ODM requirements with us.',
  photos: [
    ['01.jpg','Black — front'],
    ['02.jpg','Black — back'],
    ['03.jpg','Blue — front'],
    ['04.jpg','Blue — back'],
    ['05.jpg','Hem adjustment detail'],
    ['06.jpg','Grey — front'],
    ['07.jpg','Grey — back'],
    ['08.jpg','Interior view'],
    ['09.jpg','Additional hem detail'],
  ].map(([file,label]) => ({src:`images/products/MH0001/${file}`,label,displaySrc:file === '01.jpg' ? 'images/products/MH0001/01-display.png' : undefined})),
}, {
  style: 'Nano',
  legacyStyle: 'MH0002',
  category: 'OUTDOOR',
  gender: 'Men',
  subcategory: 'Hardshell Jackets',
  title: "Nano Men's Hooded Jacket",
  description: 'A men’s hooded outdoor jacket, shown in grey and black with front, back, hood detail and interior photographs. Discuss your material, sizing and OEM / ODM requirements with us.',
  photos: [
    ['01.jpg','Grey — front'],
    ['02.jpg','Hood adjustment detail'],
    ['03.jpg','Black — front'],
    ['04.jpg','Black — back'],
    ['05.jpg','Interior view'],
  ].map(([file,label]) => ({src:`images/products/MH0002/${file}`,label,displaySrc:file === '01.jpg' ? 'images/products/MH0002/01-display.png' : undefined})),
}];

export function findUploadedProduct(value) {
  return uploadedProducts.find(product => product.style === value || product.legacyStyle === value);
}
