import EventEmitter from 'eventemitter3'
import { loadScript, loadFileAs, isFileExist } from './utils/require'
import axios from 'axios'
import logger from './utils/logger'

export default class Session extends EventEmitter {

  static EVENT_SAVED = 'saved'
  static EVENT_CLOSED = 'closed'

  /**
   * @param {Object} params 
   * @param {String} params.imagesUrl – URL to client's stored images
   */
  constructor({
      userId,
      materialId,
      target,
      sessionId,
      editorUrl,
      contentUrl,
      imagesUrl,
      lackingImages = [],
      uploadUrlForLackingImages = null,
    }) {
    super()

    this.userId = userId
    this.materialId = materialId
    this.target = target

    this.sessionId = sessionId
    this.editorUrl = editorUrl
    this.contentUrl = contentUrl

    if (imagesUrl.endsWith('/')) {
      imagesUrl = imagesUrl.slice(0, -1)
    }

    this.imagesUrl = imagesUrl
    this.lackingImages = lackingImages
    this.uploadUrlForLackingImages = uploadUrlForLackingImages

    this.window = null
    this.lastSaveDate = 0
  }

  async uploadLackingImages() {
    if (this.lackingImages.length > 0 && this.uploadUrlForLackingImages) {
      try {
        logger.info(`Downloading ${this.lackingImages.length} lacking images...`)

        const formData = new FormData()

        formData.append('session_id', this.sessionId)

        for (const filename of this.lackingImages) {
          try {
            formData.append(filename, await loadFileAs(`${this.contentUrl}/${filename}`, 'blob'))
          } catch(error) {
            logger.error(`Couldn't download ${filename}: ${error.mesage}`)
          }
        }

        logger.info(`Uploading lacking images...`)

        await axios.post(this.uploadUrlForLackingImages, formData)
      } catch(error) {
        logger.error(`Couldn't upload lacking images: ${error.message}`)
      }
    }
  }

  async open() {
    if (this.window) {
      this.window.focus()
      return
    }

    await this.uploadLackingImages()

    await loadScript('//wormhole.verstka.org/wormhole.js')

    const wormhole = new Wormhole(`hi ${this.sessionId}`)

    wormhole.on('Article saved', ({ date }) => {

      logger.info(`Article saved at ${date}`)

      if (date > this.lastSaveDate) {
        this.lastSaveDate = date
        this.save()
      }
    })

    wormhole.on('Article closed', () => {
      logger.info(`Article closed`)
      this.close()
    })

    this.window = window.open(this.editorUrl)
  }

  close() {
    if (this.window) {
      this.window.close()
      this.window = null
      this.emit(Session.EVENT_CLOSED, {
        userId: this.userId,
        materialId: this.materialId,
        target: this.target,
      })
    }
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
      userId: this.userId,
      materialId: this.materialId,
      target: this.target,
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