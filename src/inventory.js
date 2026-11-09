// One record represents one product style; every image belongs to its gallery.
export const uploadedProducts = [{
  style: 'MH0001',
  category: 'OUTDOOR',
  gender: 'Men',
  subcategory: 'Hardshell Jackets',
  title: "MH0001 Men's Hooded Jacket",
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
  ].map(([file,label]) => ({src:`images/products/MH0001/${file}`,label})),
}];
