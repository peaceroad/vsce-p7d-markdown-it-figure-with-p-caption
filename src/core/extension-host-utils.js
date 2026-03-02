import path from 'path'
import { fileURLToPath } from 'url'

export const escapeHtmlAttribute = (value) => (
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
)

const isValidFrontmatterKey = (key) => {
  if (!key) return false
  for (let index = 0; index < key.length; index += 1) {
    const code = key.charCodeAt(index)
    if (code <= 32 || code === 58) return false
  }
  return true
}

export const parseFrontmatter = (src) => {
  const frontmatter = {}
  if (!src) return frontmatter
  let startIndex = 0
  if (src.charCodeAt(0) === 0xfeff) {
    startIndex = 1
  }
  if (src.length < startIndex + 3 || src.slice(startIndex, startIndex + 3) !== '---') {
    return frontmatter
  }
  const firstLineEnd = src.indexOf('\n', startIndex)
  if (firstLineEnd === -1) return frontmatter
  const firstLine = src.slice(startIndex, firstLineEnd).trim()
  if (firstLine !== '---') return frontmatter
  const closeIndex = src.indexOf('\n---', firstLineEnd)
  if (closeIndex === -1) return frontmatter
  const yamlContent = src.slice(firstLineEnd + 1, closeIndex)
  const lines = yamlContent.split(/\r?\n/)

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith('#')) continue
    const colonIndex = trimmedLine.indexOf(':')
    if (colonIndex <= 0) continue

    const key = trimmedLine.slice(0, colonIndex).trim()
    if (!isValidFrontmatterKey(key)) continue

    let value = trimmedLine.slice(colonIndex + 1).trim()
    if (!value) continue
    const quote = value[0]
    if ((quote === '"' || quote === '\'') && value[value.length - 1] === quote && value.length >= 2) {
      value = value.slice(1, -1)
    }

    if (value === 'true') value = true
    else if (value === 'false') value = false

    frontmatter[key] = value
  }

  return frontmatter
}

export const resolveEnvPath = (envPath, { parseUri } = {}) => {
  if (typeof envPath === 'string') {
    const trimmed = envPath.trim()
    if (!trimmed) return ''
    if (path.isAbsolute(trimmed)) return trimmed
    if (trimmed.startsWith('file:')) {
      try {
        return fileURLToPath(trimmed)
      } catch {
        return trimmed
      }
    }
    if (typeof parseUri === 'function') {
      try {
        const parsed = parseUri(trimmed)
        if (parsed?.scheme && parsed.scheme !== 'untitled') {
          return parsed.fsPath || parsed.path || trimmed
        }
      } catch {
        return trimmed
      }
    }
    return trimmed
  }
  if (envPath instanceof URL && envPath.protocol === 'file:') {
    return fileURLToPath(envPath)
  }
  if (envPath && typeof envPath.fsPath === 'string') {
    return envPath.fsPath
  }
  return ''
}

export const createMdPathResolver = ({ parseUri, getActiveMarkdownPath } = {}) => {
  const resolve = (env) => {
    if (!env || typeof env !== 'object') return ''
    if (typeof env.mdPath === 'string' && env.mdPath.trim()) return env.mdPath
    if (env.mdPath && typeof env.mdPath.fsPath === 'string') {
      env.mdPath = env.mdPath.fsPath
      return env.mdPath
    }

    const envPath =
      env.path ||
      env.filePath ||
      env.resourcePath ||
      env.resource ||
      env.document?.uri ||
      env.documentUri
    const resolvedEnvPath = resolveEnvPath(envPath, { parseUri })
    if (resolvedEnvPath) {
      env.mdPath = resolvedEnvPath
      return env.mdPath
    }

    const activeMdPath = typeof getActiveMarkdownPath === 'function'
      ? getActiveMarkdownPath()
      : ''
    if (activeMdPath) {
      env.mdPath = activeMdPath
      return env.mdPath
    }

    return ''
  }

  return {
    resolve,
  }
}
