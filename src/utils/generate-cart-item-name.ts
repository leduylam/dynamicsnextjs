import isEmpty from "lodash/isEmpty";

export function generateCartItemName(name: string, attributes: object) {
  if (!isEmpty(attributes)) {
    const attributeString =
      typeof attributes === "string" ? attributes : attributes.toString();
    const sortedAttributes = attributeString.split(".");
    const newAttribute = sortedAttributes.slice(1);

    return `${name} - ${newAttribute.join(", ")}`;
  }
  return name;
}
