function convertNames(names, nameFormat) {
    const inputNames = names.split(/[\n;,]+/).map(name => name.trim()).filter(name => name.length > 0);
    const outputNames = inputNames.map(name => {
        if (nameFormat === 'last_first') {
            const nameParts = name.split(/[\s,]+/);
            return `${nameParts.pop()}, ${nameParts.join(' ')}`;
        } else if (nameFormat === 'powerapps') {
            return name;
        } else {
            const nameParts = name.split(/[\s,]+/);
            return nameParts.join(' ');
        }
    });

    return outputNames;
}
