/**
 * Returns true if script with given source already exists
 * @param {String} src 
 * @returns {Boolean}
 */
function isScriptExists(src) {
  const allScripts = document.getElementsByTagName('script')
  
  return Array.from(allScripts).some(script => {
    return script.src === src
  })
}

/**
 * Loads script with given source
 * @param {String} src 
 * @returns {Promise<void>}
 */
export async function loadScript(src, { attributes = {} } = {}) {
  if (isScriptExists(src)) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')

    script.async = true;

    for (const name in attributes) {
      script.setAttribute(name, attributes[name])
    }

    script.addEventListener('load', resolve, {
      once: true,
    })

    script.addEventListener('error', () => {
      reject(new Error(`Couldn't require script "${src}"`))
    }, {
      once: true,
    })

    script.src = src

    document.getElementsByTagName('head')[0].appendChild(script)
  })
}