function withNestedField(get, field, itemsById, id, defaultValue = null) {
    if (!id)
        return defaultValue;
    if (itemsById[id])
        return itemsById[id][field]
    else {
        get(id);
        return defaultValue
    }
}

export default withNestedField;