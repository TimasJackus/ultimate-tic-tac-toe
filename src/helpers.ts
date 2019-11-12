export const changes = (oldObj, newObj) => {
    const obj = {};
    Object.keys(newObj).map(key => {
        if (newObj[key] !== oldObj[key]) {
            obj[key] = newObj[key];
        }
    });
    return obj;
};