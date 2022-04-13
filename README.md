# Verstka JavaScript SDK

## Installation
```bash
npm i verstka-js-sdk
```

## Usage

### Creating  SDK instance

SDK instance is created once. It allows to open and close multiple editor windows.
To create the instance you will need:

- `apiKey` – your API-key
- `imagesOrigin` – the domain from which your images are served
- `dev` — ability to connect to the our dev server, `false` bu default

You can also set `verbose: true` for explicit logs, which is `false` by default.

```javascript
import VerstkaSDK from 'verstka-js-sdk'

const sdk = new VerstkaSDK({
  apiKey: 'fd07ff6ed5954c9675578c96b4cdf39d',
  imagesOrigin: 'https://domain.com',
  verbose: true,
  dev: true,
})
```

### Opening editor window

Call `openEditor` to open editor window:

- `userId` – ID of current user. Verstka doesn't use this ID. You can "hardcode" it if you don't need it either.
- `materialID` – ID of current article. Verstka uses it for version history.
- `target` – allows you to edit `desktop` or `mobile` (or whatever) versions at the same time. It's `desktop` by default.
- `html` – artcile HTML. It's supposed to be empty when new article is created. When the article is edited, it contains the HTML of the previous version.
- `customFields` – JSON with arbitrary data. You will get back when the article is saved. Empty by default. 

```javascript
const session = await sdk.openEditor({
  userId: '42',
  materialId: '69',
  target: 'desktop',
  html: '',
  customFields: {},
})
```

Combination of `userId`, `materialID` and `target` forms a unique key. If `session` with this key already exists then `openEditor` will return it.

### Closing editor window

Open window can be closed by calling `close` method:
```javascript
session.close()
```
Editor window can also be closed manually by the user. In both cases event `closed` will be emitted.

### Saving article

Created `session` inherits `EventEmitter` interface.<br/>
Event `saved` is emmited everytime the user saves the article in the editor window:

```javascript
/**
 * Contains your code which handles article saving
 * 
 * @param {Object} data
 * @param {String} data.html – article HTML
 * @param {Blob[]} data.images – list of images as Blobs
 * @param {Object} data.customFields
 * @param {String} data.userId
 * @param {String} data.materialId
 * @param {String} data.target
 * 
 * @returns {void}
 */
function onSave({ html, images, customFields, userId, materialId, target }) {
  //...
}

session.on('saved', onSave)
```

Event `closed` is emitted whenever editor window is closed:
```javascript
/**
 * Contains your code which handles article closing
 * 
 * @param {Object} data
 * @param {String} data.userId
 * @param {String} data.materialId
 * @param {String} data.target
 * 
 * @returns {void}
 */
function onClose({ html, images, customFields, userId, materialId, target }) {
  //...
}

session.on('closed', onClose)
```

### Peer deps

- axios ^0.24.0
