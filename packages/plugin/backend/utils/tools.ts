export async function getCollection(
  id: string | undefined,
  name: string | undefined
) {
  if (id) {
    return await figma.variables.getVariableCollectionByIdAsync(id);
  }
  if (name) {
    return await figma.variables
      .getLocalVariableCollectionsAsync()
      .then((collections) =>
        collections.find((collection) => collection.name === name)
      );
  }
  return undefined;
}
