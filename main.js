import VerstkaSDK from './src/sdk'

const sdk = new VerstkaSDK({
  apiKey: 'f87e056d977143ce4afdb07612d9cebb',
  imagesOrigin: 'https://dvnw.ru',
})

const session = await sdk.openEditor({
  userId: 1,
  materialId: 1,
})

session.on('saved', data => {
  console.log('saved', data)
})

// export default VerstkaSDK