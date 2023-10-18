import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { type FastifyInstance } from 'fastify'

export async function registerSwagger (server: FastifyInstance) {
  server.log.info('registering swagger')
  await server.register(swagger, {
    openapi: {
      info: {
        title: 'Chronwell x Echosens Test Api',
        description: 'Test api for Chronwell x Echosens',
        version: '0.1.0'
      },
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            name: 'x-echosens-api-key',
            in: 'header'
          }
        }
      }
    }
  })

  await server.register(swaggerUI, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    uiHooks: {
      onRequest: function (request, reply, next) { next() },
      preHandler: function (request, reply, next) { next() }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
    transformSpecificationClone: true
  })
}
