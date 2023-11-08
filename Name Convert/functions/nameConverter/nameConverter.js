function convertNames(names, nameFormat) {
    const inputNames = names.split(/[\n;,]+/).map(name => name.trim()).filter(name => name.length > 0);
    const outputNames = inputNames.map(name => {
        const nameParts = name.split(/[\s,]+/).map(part => part.trim());
        if (nameFormat === 'last_first') {
            return `${nameParts.pop()}, ${nameParts.join(' ')}`;
        } else if (nameFormat === 'first_last') {
            return `${nameParts[1]} ${nameParts[0]}`; // Add this condition
        } else if (nameFormat === 'powerapps') {
            return name;
        } else {
            return name;
        }
    });

    return outputNames;
}

module.exports = {
    convertNames
};
