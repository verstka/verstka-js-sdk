import axios from 'axios'
import Session from './session'

export default class SDK {

  static DEFAULT_TARGET = 'desktop'

  constructor({ apiKey, imagesOrigin }) {
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
    
    const sessionKey = [userId, materialId, target].join('_')

    const existingSession = this.getSession(sessionKey)

    if (existingSession) {
      existingSession.start()
      return
    }

    const { sessionId, editorUrl, contentUrl, clientImagesFolder } = await this.getSessionData({
      userId,
      materialId,
      html,
      target,
      customFields,
    })

    const imagesUrl = (new URL(clientImagesFolder, this.imagesOrigin)).href

    const newSession = new Session({
      sessionId,
      editorUrl,
      contentUrl,
      imagesUrl,
    })

    await newSession.start()

    return newSession
  }

}