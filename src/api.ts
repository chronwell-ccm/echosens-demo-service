import { type FastifyRequest, type FastifyInstance } from 'fastify'
import * as crypto from 'crypto'

import { cyrb128, mulberry32 } from './utils.js'
import type { GetOrgQueryString, GetOrgsHeaders, Patient, PostPatientHeader } from './types.js'

export function registerApi (server: FastifyInstance) {
  server.log.info('registering api')

  server.get('/healthz', { logLevel: 'error', schema: { hide: true } }, async (request, reply) => {
    return await reply.code(200).send()
  })

  server.get('/organizations', {
    schema: {
      description: 'Get organization Id from email',
      security: [{ apiKey: [] }],
      querystring: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'email address'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            organizationUid: {
              type: 'string'
            },
            userEmail: {
              type: 'string'
            },
            organizationName: {
              type: 'string'
            }
          }
        },
        400: {
          type: 'object',
          properties: {
            message: {
              type: 'string'
            }
          }
        },
        401: {
          type: 'object',
          properties: {
            message: {
              type: 'string'
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: GetOrgQueryString, Headers: GetOrgsHeaders }>, reply) => {
    const userEmail = request.query.userEmail ?? ''
    const apiKey = request.headers['x-api-key'] ?? ''

    if (apiKey !== process.env.API_KEY) {
      return await reply.code(401).send({ message: 'x-api-key is required' })
    }

    if (userEmail === '') {
      return await reply.code(400).send({ message: 'email is required' })
    }

    const seed = cyrb128(userEmail)
    const rand = mulberry32(seed[0])

    const organizationUid = Math.round(rand() * 1000000000)

    return await reply.code(200).send({ organizationUid, userEmail, organizationName: 'test organization' })
  })

  server.post('/patient', {
    config: {
      rawBody: true
    },
    schema: {
      description: 'webhook for patient with high or intermediate risk of fib4',
      headers: {
        type: 'object',
        properties: {
          'x-chronwell-signature': {
            type: 'string',
            description: 'signature'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: {
              type: 'string'
            }
          }
        },
        400: {
          type: 'object',
          properties: {
            message: {
              type: 'string'
            }
          }
        },
        500: {
          type: 'object',
          properties: {
            message: {
              type: 'string'
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: Patient, Headers: PostPatientHeader }>, reply) => {
    const receivedSignature = request.headers['x-chronwell-signature'] ?? ''
    const apiKey = request.headers['x-api-key'] ?? ''

    if (apiKey !== process.env.API_KEY) {
      return await reply.code(401).send({ message: 'x-api-key is required' })
    }

    try {
      if (receivedSignature !== '') {
        const body = Buffer.from(request.rawBody ?? '')

        const signature = crypto
          .createHmac('sha1', process.env.WEBHOOK_SECRET ?? 'secret')
          .update(body)
          .digest('hex')
        const trusted = Buffer.from(`sha1=${signature}`, 'ascii')
        const untrusted = Buffer.from(receivedSignature, 'ascii')
        const isValidSign = crypto.timingSafeEqual(trusted, untrusted)

        if (isValidSign) {
          const patient = request.body
          server.log.info(`OrganizationId ${patient.organizationUid}`)
          server.log.info(`Patient ${patient.firstName} ${patient.lastName}`)
          server.log.info(`Score ${patient.fib4Score} Risk ${patient.fib4Risk}`)
          return await reply.code(200).send({ message: 'ok' })
        }
      }
    } catch (err) {
      server.log.error(err)
      return await reply.code(500).send({ message: 'error' })
    }

    return await reply.code(400).send({ message: 'error' })
  })
}
