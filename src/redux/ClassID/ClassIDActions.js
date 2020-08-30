const updateClassId = (ClassId) => {
    return {
        type: 'UPDATE_ClassId',
        ClassId
    }
}

const removeClassId = () => {
    return {
        type: 'REMOVE_ClassId'
    }
}

export { updateClassId, removeClassId };