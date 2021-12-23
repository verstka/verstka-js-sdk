import axios from 'axios'
import Session from './session'
import logger from './utils/logger'

export default class SDK {

  static DEFAULT_TARGET = 'desktop'

  constructor({ apiKey, imagesOrigin, verbose = true }) {
    logger.setLevel(verbose ? 0 : 1)

    logger.infoData(`Initialize SDK`, { apiKey, imagesOrigin, verbose })

    this.apiKey = apiKey
    this.imagesOrigin = new URL(imagesOrigin)

    this.activeSessions = {}
  }

  async getSessionData({ userId, materialId, html, target, customFields }) {
    const fromData = new FormData()

    fromData.append('user_id', userId)
		fromData.append('material_id', `${materialId}_${target}`)
		fromData.append('html_body', html)
		fromData.append('host_name', this.imagesOrigin.host)
		fromData.append('api-key', this.apiKey)
    fromData.append('custom_fields', JSON.stringify(customFields));

    const { data: payload } = await axios.post('//dev.verstka.io/api/open', fromData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (!payload?.data) {
      throw new Error(`No data`)
    }

    for (const key of ['session_id', 'contents', 'client_folder', 'edit_url']) {
      if (!payload.data[key]) {
        throw new Error(`Missing key "${key}"`)
      } 
    }

    return {
      sessionId: payload.data.session_id,
      editorUrl: payload.data.edit_url,
      contentUrl: payload.data.contents,
      clientImagesFolder: payload.data.client_folder,
      lackingImages: payload.data.lacking_pictures || [],
      uploadUrlForLackingImages: payload.data.upload_url,
    }
  }

  addSession(key, session) {
    this.activeSessions[key] = session
  }

  getSession(key) {
    return this.activeSessions[key]
  }

  async openEditor({
    userId,
    materialId,
    html = '',
    target = SDK.DEFAULT_TARGET,
    customFields = {},
  }) {

    logger.infoData(`openEditor`, {
      userId,
      materialId,
      'HTML length': html.length,
      target,
      customFields,
    })
    
    const sessionKey = [userId, materialId, target].join('_')

    const existingSession = this.getSession(sessionKey)

    if (existingSession) {
      logger.info(`Session ${sessionKey} already exists`)
      existingSession.start()
      return
    }

    const { sessionId, editorUrl, contentUrl, clientImagesFolder, lackingImages, uploadUrlForLackingImages } = await this.getSessionData({
      userId,
      materialId,
      html,
      target,
      customFields,
    })

    /**
     * If clientImagesFolder is relative path then imagesOrigin will be applied.
     * If clientImagesFolder is an URL – will be used as it is.
     */
    const imagesUrl = (new URL(clientImagesFolder, this.imagesOrigin)).href

    logger.infoData(`Creating new session`, {
      sessionId,
      editorUrl,
      contentUrl,
      clientImagesFolder,
      lackingImages,
      uploadUrlForLackingImages,
    })

    const newSession = new Session({
      sessionId,
      editorUrl,
      contentUrl,
      imagesUrl,
      lackingImages,
      uploadUrlForLackingImages,
    })

    await newSession.start()

    return newSession
  }

}