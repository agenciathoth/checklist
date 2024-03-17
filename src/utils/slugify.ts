export const slugify = (name: string) => {
  return name.toLowerCase().split(" ").filter(Boolean).join("-");
};
