// /utils/maps.js
export function createMapById(array) {
  return array.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});
}
