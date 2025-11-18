
export interface Slide {
  image: any;
  title: string;
  subtitle: string;
  price: string;
  cta: string;
}

export const slides: Slide[] = [
  {
    image: require("../assets/images/slide_m.png"),
    title: "New Arrivals",
    subtitle: "Men's fashion",
    price: "Asking price from GHC50.00",
    cta: "see more",
  },
  {
    image: require("../assets/images/slide_o.png"),
    title: "Summer Collection",
    subtitle: "Light & Breezy",
    price: "From GHC30.00",
    cta: "Shop Now",
  },
  {
    image: require("../assets/images/slide_b.png"),
    title: "Limited Offer",
    subtitle: "Best sellers",
    price: "Up to 40% off",
    cta: "Grab it",
  },
];
