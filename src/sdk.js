import EventEmitter from 'eventemitter3'
import axios from 'axios'

import { loadScript } from './require'

export default class VerstkaSDK extends EventEmitter {

  static EVENT_SAVED = 'saved'

  constructor({ apiKey, urlToImages }) {
    super()

    this.apiKey = apiKey
    this.urlToImages = urlToImages
  }

  async open({ userId, meterialId, html = '', target = 'desktop', customFields = {} }) {
    await loadScript('//wormhole.verstka.io/wormhole.js')

    const fromData = new FormData()

    fromData.append('user_id', userId)
		fromData.append('material_id', `${meterialId}_${target}`)
		fromData.append('html_body', html)
		fromData.append('host_name', this.urlToImages)
		fromData.append('api-key', this.apiKey)
    fromData.append('custom_fields', JSON.stringify(customFields));

    const { data: openData } = await axios.post('//verstka.io/api/open', fromData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    const wormhole = new Wormhole(`hi ${openData.session_id}`)

    wormhole.on('Article saved', saveData => {
      console.log('Article saved', saveData)
    })

    wormhole.on('Article closed', () => {
      console.log('Article closed')
    })

    /**
     * openData:
     * session_id
     * contents (url?)
     * client_folder
     * edit_url
     */

    // const editorWindow = window.open(openData.edit_url)
  }

}