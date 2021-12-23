class Logger {

  static LEVEL_INFO = 0
  static LEVEL_WARN = 1
  static LEVEL_ERROR = 2

  constructor(name, level = Logger.LEVEL_INFO) {
    this.name = name
    this.level = level
    this.prefix = `[${name}]`
  }

  setLevel(level) {
    this.level = level
  }

  infoData(message, data) {
    if (this.level >= Logger.LEVEL_INFO) {
      console.log(this.prefix, message, JSON.stringify(data, null, 2))
    }
  }

  info(...message) {
    if (this.level >= Logger.LEVEL_INFO) {
      console.log(this.prefix, ...message)
    }
  }

  warn(...message) {
    if (this.level >= Logger.LEVEL_WARN) {
      console.warn(this.prefix, ...message)
    }
  }

  error(...message) {
    if (this.level >= Logger.LEVEL_ERROR) {
      console.error(this.prefix, ...message)
    }
  }
}

export default new Logger('Verstka SDK')