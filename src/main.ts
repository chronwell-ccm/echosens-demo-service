import fastify from 'fastify'
import dotenv from 'dotenv'
import { registerSwagger } from './swagger.js'
import closeWithGrace from 'close-with-grace'
import fastifyRawBody from 'fastify-raw-body'
import { registerApi } from './api.js'

dotenv.config()

const start = async () => {
  const server = fastify({
    logger: true
  })

  try {
    closeWithGrace({ delay: 500 }, async ({ err }) => {
      server.log.info('server closed')

      if (typeof err !== 'undefined') {
        server.log.error(err)
        process.exit(1)
      }

      await server.close()
      process.exit(0)
    })

    await server.register(fastifyRawBody, {
      field: 'rawBody',
      global: false
    })

    await registerSwagger(server)

    registerApi(server)

    const port = parseInt(process.env.PORT ?? '3000')
    await server.listen({ port, host: '0.0.0.0' })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

try {
  await start()
} catch (e) {
  console.log(e)
  process.exit(1)
}
