import type { Category, ProductSort } from './products.types';

export const categoryNames: Record<Category, string> = {
  beauty: 'Beauty',
  fragrances: 'Fragrances',
  furniture: 'Furniture',
  groceries: 'Groceries',
  'home-decoration': 'Home decoration',
  'kitchen-accessories': 'Kitchen accessories',
  laptops: 'Laptops',
  'mens-shirts': 'Men’s shirts',
  'mens-shoes': 'Men’s shoes',
  'mens-watches': 'Men’s watches',
  'mobile-accessories': 'Mobile accessories',
  motorcycle: 'Motorcycles',
  'skin-care': 'Skin care',
  smartphones: 'Smartphones',
  'sports-accessories': 'Sports accessories',
  sunglasses: 'Sunglasses',
  tablets: 'Tablets',
  tops: 'Tops',
  vehicle: 'Vehicles',
  'womens-bags': 'Women’s bags',
  'womens-dresses': 'Women’s dresses',
  'womens-jewellery': 'Women’s jewellery',
  'womens-shoes': 'Women’s shoes',
  'womens-watches': 'Women’s watches',
};

export const sortNames: Record<ProductSort, string> = {
  default: 'Default',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  rating: 'Top rated',
  name: 'Name: A–Z',
};

export const pageSize = 12;
