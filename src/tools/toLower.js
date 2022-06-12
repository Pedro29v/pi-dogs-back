
const toLower = (name) => {

    let nameLower =  name.toLowerCase();

    let nameUperCase = nameLower[0].toUpperCase() + nameLower.substring(1)

    return nameUperCase;
}

module.exports = toLower