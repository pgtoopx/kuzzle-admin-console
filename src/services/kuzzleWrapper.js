import kuzzle from './kuzzle'
import Promise from 'bluebird'
import * as types from '../vuex/modules/auth/mutation-types'

export const waitForConnected = (timeout = 1000) => {
  if (kuzzle.state !== 'connected') {
    return new Promise((resolve, reject) => {
      // Timeout, if kuzzle doesn't respond in 1s (default) -> reject
      let timeoutId = setTimeout(() => {
        kuzzle.removeListener('connected', id)
        reject(new Error('Kuzzle does not respond'))
      }, timeout)

      let id = kuzzle.addListener('connected', () => {
        clearTimeout(timeoutId)
        kuzzle.removeListener('connected', id)
        resolve()
      })
    })
  }

  return Promise.resolve()
}

export const connectToEnvironment = (environment) => {
  if (kuzzle.state === 'connected') {
    kuzzle.disconnect()
  }

  kuzzle.host = environment.host
  kuzzle.ioPort = environment.ioPort
  kuzzle.wsPort = environment.wsPort
  kuzzle.connect()
}

export const initStoreWithKuzzle = (store) => {
  kuzzle.removeAllListeners('jwtTokenExpired')
  kuzzle.removeAllListeners('queryError')
  kuzzle.addListener('queryError', (error) => {
    if (error && error.message) {
      switch (error.message) {
        case 'Token expired':
        case 'Invalid token':
        case 'Json Web Token Error':
          store.commit(types.SET_TOKEN_VALID, false)
          break
      }
    }
  })
}

// Helper for performSearch
let getValueAdditionalAttribute = (content, attributePath) => {
  let attribute = attributePath.shift()

  if (typeof content[attribute] === 'object') {
    return getValueAdditionalAttribute(content[attribute], attributePath)
  }

  return content[attribute]
}

export const performSearchDocuments = (collection, index, filters = {}, pagination = {}, sort = []) => {
  if (!collection || !index) {
    return Promise.reject(new Error('Missing collection or index'))
  }

  return kuzzle
    .dataCollectionFactory(collection, index)
    .searchPromise({...filters, ...pagination, sort})
    .then(result => {
      let additionalAttributeName = null

      if (sort.length > 0) {
        if (typeof sort[0] === 'string') {
          additionalAttributeName = sort[0]
        } else {
          additionalAttributeName = Object.keys(sort[0])[0]
        }
      }

      let documents = result.documents.map((document) => {
        let object = {
          content: document.content,
          id: document.id
        }

        if (additionalAttributeName) {
          object.additionalAttribute = {
            name: additionalAttributeName,
            value: getValueAdditionalAttribute(document.content, additionalAttributeName.split('.'))
          }
        }

        return object
      })

      return {documents: documents, total: result.total}
    })
}

export const performSearchUsers = (collection, index, filters = {}, pagination = {}, sort = []) => {
  return kuzzle
    .security
    .searchUsersPromise({...filters, ...pagination, sort})
    .then(result => {
      let additionalAttributeName = null

      if (sort.length > 0) {
        if (typeof sort[0] === 'string') {
          additionalAttributeName = sort[0]
        } else {
          additionalAttributeName = Object.keys(sort[0])[0]
        }
      }

      let users = result.users.map((document) => {
        let object = {
          content: document.content,
          id: document.id
        }

        if (additionalAttributeName) {
          object.additionalAttribute = {
            name: additionalAttributeName,
            value: getValueAdditionalAttribute(document.content, additionalAttributeName.split('.'))
          }
        }

        return object
      })

      return {documents: users, total: result.total}
    })
}

export const performSearchProfiles = (collection, index, filters = {}, pagination = {}, sort = []) => {
  return kuzzle
    .security
    .searchProfilesPromise({...filters, ...pagination, sort})
    .then(result => {
      let additionalAttributeName = null

      if (sort.length > 0) {
        if (typeof sort[0] === 'string') {
          additionalAttributeName = sort[0]
        } else {
          additionalAttributeName = Object.keys(sort[0])[0]
        }
      }

      let profiles = result.profiles.map((document) => {
        let object = {
          content: document.content,
          id: document.id
        }

        if (additionalAttributeName) {
          object.additionalAttribute = {
            name: additionalAttributeName,
            value: getValueAdditionalAttribute(document.content, additionalAttributeName.split('.'))
          }
        }

        return object
      })

      return {documents: profiles, total: result.total}
    })
}

export const performSearchRoles = (collection, index, filters = {}, pagination = {}, sort = []) => {
  return kuzzle
    .security
    .searchRolesPromise({...filters, ...pagination, sort})
    .then(result => {
      let additionalAttributeName = null

      if (sort.length > 0) {
        if (typeof sort[0] === 'string') {
          additionalAttributeName = sort[0]
        } else {
          additionalAttributeName = Object.keys(sort[0])[0]
        }
      }

      let roles = result.roles.map((document) => {
        let object = {
          content: document.content,
          id: document.id
        }

        if (additionalAttributeName) {
          object.additionalAttribute = {
            name: additionalAttributeName,
            value: getValueAdditionalAttribute(document.content, additionalAttributeName.split('.'))
          }
        }

        return object
      })

      return {documents: roles, total: result.total}
    })
}

export const deleteDocuments = (index, collection, ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0 || !index || !collection) {
    return
  }

  return new Promise((resolve, reject) => {
    kuzzle
      .dataCollectionFactory(collection, index)
      .deleteDocument({query: {ids: {values: ids}}}, (error) => {
        if (error) {
          return reject(new Error(error.message))
        }

        kuzzle.refreshIndex(index, () => {
          resolve()
        })
      })
  })
}
