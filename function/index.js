const DVC = require('@devcycle/nodejs-server-sdk')

// Handler
exports.handler = async function(event, context) {
  const dvcClient = await DVC.initialize('<SERVER_TOKEN>').onClientInitialized()
  console.log("Devcycle initialized!")
  const processedEvents = []
  event.Records.forEach(record => {
    console.log("original record: ", JSON.stringify(record))
    processedEvents.push(processRecord(record, dvcClient))
  })
  return processedEvents
}

const processRecord = (record, dvcClient) => {
  const data = record.kinesis.data
  const user = {
    user_id: data.user_id
  }

  const eventType = dvcClient.variable(user, 'event-type', 'my_event')
  if (data.type === 'my_event') {
    data.type = eventType.value
  }

  console.log("Event being output: ", JSON.stringify(data))
  // Save event wherever it needs to be!
  return data
}
