import VerstkaSDK from './src/sdk'

const sdk = new VerstkaSDK({
  apiKey: 'f87e056d977143ce4afdb07612d9cebb',
  urlToImages: 'dvnw.ru',
})

// console.log(sdk)

await sdk.open({})

// export default VerstkaSDK