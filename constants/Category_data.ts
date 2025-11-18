export interface CategoryItem {
  id: string;
  name: string;
  image: any;
}

export const categorySections = {
  title: "Categories",
  data: [
    {
      id: "1",
      name: "Electronics",
      image: require("../assets/images/slide_b.png"),
    },
    {
      id: "2",
      name: "Fashion",
      image: require("../assets/images/slide_m.png"),
    },
    {
      id: "3",
      name: "Groceries",
      image: require("../assets/images/slide_o.png"),
    },
    {
      id: "4",
      name: "Home & Living",
      image: require("../assets/images/shirt.jpg"),
    },
  ] as CategoryItem[],
};

export interface CategoryProduct {
  id: string;
  title: string;
  price: number;
  image: any;
  shop?: string;
  rating?: number;
  reviews?: string;
}

export interface CategorySection {
  title: string;
  products: CategoryProduct[];
}

export const categorySectionsWithItems: CategorySection[] = [
  {
    title: "Electronics",
    products: [
      {
        id: "e1",
        title: "Wireless Headphones",
        rating: 4.8,
        reviews: "320k",
        price: 120,
        image: require("../assets/images/slide_b.png"),
      },
      {
        id: "e2",
        title: "Smart Watch",
        rating: 4.6,
        reviews: "48k",
        price: 199,
        image: require("../assets/images/slide_m.png"),
      },
      {
        id: "e3",
        title: "Bluetooth Speaker",
        rating: 4.7,
        reviews: "92k",
        price: 80,
        image: require("../assets/images/slide_o.png"),
      },
      {
        id: "e4",
        title: "Portable Charger",
        rating: 4.5,
        reviews: "22k",
        price: 35,
        image: require("../assets/images/charlesdeluvio-krsBQymp76k-unsplash.jpg"),
      },
      {
        id: "e5",
        title: "Action Camera",
        rating: 4.4,
        reviews: "15k",
        price: 80,
        image: require("../assets/images/electronics2.png"),
      },
      {
        id: "e6",
        title: "Bluetooth Speaker",
        rating: 4.8,
        reviews: "320k",
        price: 80,
        image: require("../assets/images/electronics2.png"),
      },
    ],
  },
  {
    title: "Fashion",
    products: [
      {
        id: "f1",
        title: "Men's Casual Shirt",
        rating: 4.6,
        reviews: "21k",
        price: 45,
        image: require("../assets/images/shirt.jpg"),
      },
      {
        id: "f2",
        title: "Women's Summer Dress",
        rating: 4.8,
        reviews: "68k",
        price: 75,
        image: require("../assets/images/raquel-gambin-kS3YkVtf85U-unsplash.jpg"),
      },
      {
        id: "f3",
        title: "Classic Sneakers",
        rating: 4.7,
        reviews: "44k",
        price: 90,
        image: require("../assets/images/shoe.jpg"),
      },
      {
        id: "f4",
        title: "Denim Jacket",
        rating: 4.5,
        reviews: "12k",
        price: 120,
        image: require("../assets/images/man-img.png"),
      },
      {
        id: "f5",
        title: "Evening Gown",
        rating: 4.9,
        reviews: "80k",
        price: 220,
        image: require("../assets/images/valerie-elash-gsKdPcIyeGg-unsplash.jpg"),
      },
      {
        id: "f6",
        title: "Casual Tee",
        rating: 4.4,
        reviews: "9k",
        price: 30,
        image: require("../assets/images/tamara-harhai-A5nuQ2Lvg40-unsplash.jpg"),
      },
    ],
  },
  {
    title: "Groceries",
    products: [
      {
        id: "g1",
        title: "Organic Milk - 1L",
        rating: 4.7,
        reviews: "6k",
        price: 4,
        image: require("../assets/images/psp.jpg"),
      },
      {
        id: "g2",
        title: "Fresh Bread",
        rating: 4.5,
        reviews: "3k",
        price: 2,
        image: require("../assets/images/slide_o.png"),
      },
      {
        id: "g3",
        title: "Extra Virgin Olive Oil",
        rating: 4.8,
        reviews: "14k",
        price: 12,
        image: require("../assets/images/slide_b.png"),
      },
      {
        id: "g4",
        title: "Gourmet Coffee Beans",
        rating: 4.6,
        reviews: "9k",
        price: 15,
        image: require("../assets/images/domino-studio-164_6wVEHfI-unsplash.jpg"),
      },
      {
        id: "g5",
        title: "Artisan Cheese",
        rating: 4.7,
        reviews: "4k",
        price: 8,
        image: require("../assets/images/charlesdeluvio-krsBQymp76k-unsplash.jpg"),
      },
      {
        id: "g6",
        title: "Organic Eggs (12)",
        rating: 4.5,
        reviews: "7k",
        price: 5,
        image: require("../assets/images/maksim-larin-NOpsC3nWTzY-unsplash.jpg"),
      },
    ],
  },
  {
    title: "Home & Living",
    products: [
      {
        id: "h1",
        title: "Decor Cushion",
        rating: 4.6,
        reviews: "2k",
        price: 25,
        image: require("../assets/images/man-img.png"),
      },
      {
        id: "h2",
        title: "Table Lamp",
        rating: 4.7,
        reviews: "11k",
        price: 40,
        image: require("../assets/images/tamara-harhai-A5nuQ2Lvg40-unsplash.jpg"),
      },
      {
        id: "h3",
        title: "Wall Art Print",
        rating: 4.8,
        reviews: "6k",
        price: 60,
        image: require("../assets/images/raquel-gambin-kS3YkVtf85U-unsplash.jpg"),
      },
      {
        id: "h4",
        title: "Cozy Throw Blanket",
        rating: 4.5,
        reviews: "3k",
        price: 35,
        image: require("../assets/images/valerie-elash-gsKdPcIyeGg-unsplash.jpg"),
      },
      {
        id: "h5",
        title: "Ceramic Vase",
        rating: 4.6,
        reviews: "1.5k",
        price: 28,
        image: require("../assets/images/charlesdeluvio-krsBQymp76k-unsplash.jpg"),
      },
      {
        id: "h6",
        title: "Scented Candle",
        rating: 4.4,
        reviews: "9k",
        price: 12,
        image: require("../assets/images/slide_m.png"),
      },
    ],
  },
  {
    title: "Automobiles",
    products: [
      {
        id: "a1",
        title: "Car Floor Mats",
        rating: 4.5,
        reviews: "5k",
        price: 120,
        image: require("../assets/images/car1.png"),
      },
      {
        id: "a2",
        title: "Alloy Wheel Set",
        rating: 4.8,
        reviews: "18k",
        price: 950,
        image: require("../assets/images/car2.png"),
      },
      {
        id: "a3",
        title: "Car Vacuum Cleaner",
        rating: 4.6,
        reviews: "12k",
        price: 200,
        image: require("../assets/images/car1.png"),
      },
      {
        id: "a4",
        title: "LED Headlights",
        rating: 4.7,
        reviews: "9k",
        price: 450,
        image: require("../assets/images/car1.png"),
      },
      {
        id: "a5",
        title: "Car Air Freshener",
        rating: 4.3,
        reviews: "3k",
        price: 40,
        image: require("../assets/images/car2.png"),
      },
      {
        id: "a6",
        title: "Portable Tire Inflator",
        rating: 4.9,
        reviews: "25k",
        price: 350,
        image: require("../assets/images/car1.png"),
      },
    ],
  },
  {
    title: "Sports & Fitness",
    products: [
      {
        id: "s1",
        title: "Yoga Mat",
        rating: 4.8,
        reviews: "30k",
        price: 75,
        image: require("../assets/images/sports1.png"),
      },
      {
        id: "s2",
        title: "Dumbbell Set",
        rating: 4.7,
        reviews: "22k",
        price: 200,
        image: require("../assets/images/sports2.png"),
      },
      {
        id: "s3",
        title: "Running Shoes",
        rating: 4.9,
        reviews: "60k",
        price: 350,
        image: require("../assets/images/sports3.png"),
      },
      {
        id: "s4",
        title: "Skipping Rope",
        rating: 4.5,
        reviews: "10k",
        price: 25,
        image: require("../assets/images/sports4.png"),
      },
      {
        id: "s5",
        title: "Resistance Bands",
        rating: 4.6,
        reviews: "14k",
        price: 55,
        image: require("../assets/images/sports1.png"),
      },
      {
        id: "s6",
        title: "Smart Fitness Watch",
        rating: 4.9,
        reviews: "40k",
        price: 800,
        image: require("../assets/images/sports2.png"),
      },
    ],
  },
  {
    title: "Babies & Toys",
    products: [
      {
        id: "b1",
        title: "Plush Teddy Bear",
        rating: 4.8,
        reviews: "50k",
        price: 45,
        image: require("../assets/images/slide_b.png"),
      },
      {
        id: "b2",
        title: "Baby Stroller",
        rating: 4.7,
        reviews: "20k",
        price: 1200,
        image: require("../assets/images/slide_b.png"),
      },
      {
        id: "b3",
        title: "Building Blocks Set",
        rating: 4.9,
        reviews: "80k",
        price: 150,
        image: require("../assets/images/slide_b.png"),
      },
      {
        id: "b4",
        title: "Baby Blanket",
        rating: 4.6,
        reviews: "10k",
        price: 60,
        image: require("../assets/images/slide_b.png"),
      },
      {
        id: "b5",
        title: "Toy Car",
        rating: 4.5,
        reviews: "35k",
        price: 70,
        image: require("../assets/images/slide_b.png"),
      },
      {
        id: "b6",
        title: "Educational Laptop Toy",
        rating: 4.7,
        reviews: "22k",
        price: 200,
        image: require("../assets/images/slide_b.png"),
      },
    ],
  },
];
