export const contactEmail = "furnis012@gmail.com";

export const businessAddress = {
  line1: "Plot No. 39, Vrandavan Farm House",
  line2: "Behind Jain Mandir, Boranada",
  city: "Jodhpur",
  state: "Rajasthan",
  country: "India",
};

export const businessAddressText = [
  businessAddress.line1,
  businessAddress.line2,
  `${businessAddress.city}, ${businessAddress.state}`,
  businessAddress.country,
].join(", ");

export const businessMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  businessAddressText
)}`;
