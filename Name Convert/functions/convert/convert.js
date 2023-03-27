const nameConverter = require('../nameConverter');

exports.handler = async (event, context) => {
  const { names, nameFormat } = JSON.parse(event.body);
  const convertedNames = nameConverter.convertNames(names, nameFormat);
  const responseText =
    nameFormat === 'powerapps'
      ? `["${convertedNames.join('","')}"]`
      : convertedNames.join('; ');

  return {
    statusCode: 200,
    body: JSON.stringify({ result: responseText }),
  };
};
