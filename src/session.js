import EventEmitter from 'eventemitter3'
import { loadScript, loadFileAs, isFileExist } from './utils/require'
import axios from 'axios'

export default class Session extends EventEmitter {

  static EVENT_SAVED = 'saved'

  /**
   * 
   * @param {Object} params 
   * @param {String} params.imagesUrl – URL to client's stored images
   */
  constructor({ sessionId, editorUrl, contentUrl, imagesUrl }) {
    super()

    this.sessionId = sessionId
    this.editorUrl = editorUrl
    this.contentUrl = contentUrl

    if (imagesUrl.endsWith('/')) {
      imagesUrl = imagesUrl.slice(0, -1)
    }

    this.imagesUrl = imagesUrl

    this.window = null
    this.lastSaveDate = 0
  }

  async start() {
    if (this.window) {
      this.window.focus()
      return
    }

    await loadScript('//wormhole.verstka.io/wormhole.js')

    const wormhole = new Wormhole(`hi ${this.sessionId}`)

    wormhole.on('Article saved', ({ date }) => {
      if (date > this.lastSaveDate) {
        this.lastSaveDate = date
        this.save()
      }
    })

    wormhole.on('Article closed', () => {
      this.stop()
    })

    this.window = window.open(this.editorUrl)
  }

  stop() {
    this.window = null
  }

  async save() {
    const { data: payload } = await axios.get(this.contentUrl)

    const fileList = payload?.data

    if (!fileList || !fileList.length) {
      throw new Error(`Couldn't get data for saving`)
    }

    const result = {
      html: '',
      customFields: {},
      images: {},
    }

    for (const filename of fileList) {
      const fileUrl = `${this.contentUrl}/${filename}`

      if (filename === 'index.html') {

        result.html = await loadFileAs(fileUrl, 'string')

      } else if (filename === 'custom_fields.json') {

        result.customFields = await loadFileAs(fileUrl, 'json')

      } else {
        
        const imageIsOriginal = Session.imageIsOriginal(filename)

        if (imageIsOriginal) {
          const imageExistsAtClient = await isFileExist(`${this.imagesUrl}/${filename}`)

          if (imageExistsAtClient) {
            continue
          }
        }

        result.images[filename] = await loadFileAs(fileUrl, 'blob')

      }
    }

    this.emit(Session.EVENT_SAVED, result)
  }

  static imageIsOriginal(filename) {
    if (filename.includes('_small.')) {
      return false
    }

    if (filename.includes('_large.')) {
      return false
    }

    return true
  }
}