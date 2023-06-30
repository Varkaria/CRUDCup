import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import cron from 'node-cron'
import { createResourceEntity, deleteCup, deleteEntity, deleteResource, getCupFormSlug, getEntities, getEntity, purgeExpiredCups, updateEntity } from './services/resource'
import { verifyCupSlug, verifyEntityId, verifyResourceName } from './utils'

export const app = new Elysia()
  .use(cors({ origin: '*' }))
  .get('/', () => JSON.stringify({
    success: true,
    code: 201,
    message: 'Welcome!',
    home: 'https://cup.m1r.ai',
    github: 'https://github.com/ST4RCHASER/CRUDCup'
  }))
  .group('/:cupId', {
    beforeHandle: async ({ set, params: { cupId } }) => verifyCupSlug(cupId),
    params: t.Object({
      cupId: t.String()
    })
  }, (cupGroup) => cupGroup
    .get('', async ({ params: { cupId } }) => await getCupFormSlug(cupId))
    .delete('', async ({ params: { cupId } }) => await deleteCup(cupId))
  )

app.group('/:cupId/:resourceId', {
  beforeHandle: ({ params: { resourceId } }) => verifyResourceName(resourceId),
  params: t.Object({
    cupId: t.String(),
    resourceId: t.String()
  })
}, (resourceGroup) => resourceGroup
  .post('', async ({ params: { cupId, resourceId }, body }) => await createResourceEntity(cupId, resourceId, body))
  .get('', async ({ params: { cupId, resourceId } }) => await getEntities(cupId, resourceId))
  .delete('', async ({ params: { cupId, resourceId } }) => await deleteResource(cupId, resourceId))
)

app.group('/:cupId/:resourceId/:entityId', {
  beforeHandle: ({ params: { entityId } }) => verifyEntityId(entityId),
  params: t.Object({
    cupId: t.String(),
    resourceId: t.String(),
    entityId: t.String(),
  })
}, (entityGroup) => entityGroup
  .get('', async ({ params: { cupId, resourceId, entityId } }) => await getEntity(cupId, resourceId, entityId))
  .put('', async ({ params: { cupId, resourceId, entityId }, body }) => await updateEntity(cupId, resourceId, entityId, body))
  .delete('', async ({ params: { cupId, resourceId, entityId } }) => await deleteEntity(cupId, resourceId, entityId))
)

app.listen({
  port: process.env.PORT || 3000,
  hostname: process.env.HOSTNAME || 'localhost'
})
console.log(`⚡ CRUDCup is running at ${app.server?.hostname}:${app.server?.port}`)

purgeExpiredCups()
cron.schedule('0 * * * *', () => {
  purgeExpiredCups()
});


export type App = typeof app
