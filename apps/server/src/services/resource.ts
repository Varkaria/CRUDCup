import db from "../db";
const expiredDays = process.env.EXPIRED_DAYS || 7

export async function updateEntity(cupId: string, resourceName: string, entityId: string, data: unknown) {
    if (!data || typeof data !== 'object') throw new Error('Invalid data only json object is allowed')
    const updated = await db.entity.updateMany({
        where: {
            id: entityId,
            resource: {
                name: resourceName,
                cup: {
                    slug: cupId
                }
            }
        },
        data: {
            data: data
        },
    })
    if (updated.count === 0) throw new Error(`Entity id ${entityId} not found`)
    return {
        ...{
            id: entityId
        },
        ...data as object
    }
}

export async function deleteEntity(cupId: string, resourceName: string, entityId: string) {
    const deleted = await db.entity.deleteMany({
        where: {
            id: entityId,
            resource: {
                name: resourceName,
                cup: {
                    slug: cupId
                }
            }
        }
    })
    if (deleted.count === 0) throw new Error(`Entity id ${entityId} not found`)
    return {
        id: entityId
    }
}

export async function getEntity(cupId: string, resourceName: string, entityId: string) {
    const entity = await db.entity.findFirst({
        where: {
            id: entityId,
            resource: {
                name: resourceName,
                cup: {
                    slug: cupId
                }
            }
        },
        select: {
            id: true,
            data: true
        }
    })
    if (!entity) throw new Error(`Entity id ${entityId} not found`)
    return {
        ...{
            id: entity.id
        },
        ...entity.data as object
    }
}

export async function getEntities(cupId: string, resourceName: string) {
    const resource = await db.resource.findFirst({
        where: {
            cup: {
                slug: cupId
            },
            name: resourceName
        },
        select: {
            entities: {
                select: {
                    id: true,
                    data: true
                }
            }
        }
    })
    if (!resource) return []
    return resource.entities.map((resourceData) => ({
        ...{
            _id: resourceData.id
        },
        ...resourceData.data as object
    }))
}

export async function createResourceEntity(cupId: string, resourceName: string, data: unknown) {
    if (!data || typeof data !== 'object') throw new Error('Invalid data only json object is allowed')
    const cup = await db.cup.findUnique({
        where: {
            slug: cupId
        },
        select: {
            id: true,
            resource: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    })
    if (!cup) {
        const newCup = await db.cup.create({
            data: {
                slug: cupId,
                resource: {
                    create: {
                        name: resourceName,
                        entities: {
                            create: {
                                data: data
                            }
                        }
                    }
                }
            },
            select: {
                resource: {
                    select: {
                        name: true,
                        entities: {
                            select: {
                                id: true,
                                data: true
                            }
                        }
                    }
                }
            }
        })
        const find = newCup.resource.find((resource) => resource.name === resourceName)?.entities.find((resourceData) => JSON.stringify(resourceData.data) === JSON.stringify(data))
        if (!find) throw new Error('Failed to create resource data')
        return {
            ...{ id: find.id },
            ...find.data as object
        }
    }
    const resource = cup.resource.find((resource) => resource.name === resourceName)
    if (!resource) {
        const newResource = await db.resource.create({
            data: {
                name: resourceName,
                cupId: cup.id,
                entities: {
                    create: {
                        data: data
                    }
                }
            },
            select: {
                id: true,
                entities: {
                    select: {
                        id: true,
                        data: true
                    }
                }
            }
        })
        return {
            ...{
                id: newResource.entities.find((entity) => JSON.stringify(entity.data) === JSON.stringify(data))?.id
            },
            ...newResource.entities.find((entity) => JSON.stringify(entity.data) === JSON.stringify(data))?.data as object
        }
    }
    const newEntity = await db.entity.create({
        data: {
            resourceId: resource.id,
            data: data
        },
        select: {
            id: true,
            data: true
        }
    })
    return {
        ...{
            id: newEntity.id
        },
        ...newEntity.data as object
    }

}

export async function deleteResource(cupId: string, resourceName: string) {
    await db.entity.deleteMany({
        where: {
            resource: {
                name: resourceName,
                cup: {
                    slug: cupId
                }
            }
        }
    })
    await db.resource.deleteMany({
        where: {
            name: resourceName,
            cup: {
                slug: cupId
            }
        }
    })
    return {
        cupId,
        resourceName
    }
}

export async function purgeExpiredCups() {
    console.log("💥 Purging expired cups...")
    const list = await db.cup.findMany({
        select: {
            id: true,
            updatedAt: true,
            resource: {
                select: {
                    updatedAt: true
                }
            }
        }
    })
    const expiredCups = list.filter((cup) => {
        let expiredAt = new Date()
        if (cup.resource?.length) expiredAt = cup.resource.reduce((prev, current) => (prev.updatedAt.getTime() > current.updatedAt.getTime()) ? prev : current).updatedAt
        else if (cup.updatedAt) expiredAt = cup.updatedAt
        expiredAt.setDate(expiredAt.getDate() + +expiredDays)
        return expiredAt.getTime() < new Date().getTime()
    })
    const result = await db.cup.deleteMany({
        where: {
            id: {
                in: expiredCups.map((cup) => cup.id)
            }
        }
    })
    console.log(`🌸 Purged expired: ${result.count} cups`)
}

export async function getCupFormSlug(cupSlug: string) {
    const cup = await db.cup.findUnique({
        where: {
            slug: cupSlug
        },
        select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            resource: {
                select: {
                    name: true,
                    updatedAt: true
                }
            }
        }
    })
    let expiredAt = new Date()
    if (cup?.resource?.length) expiredAt = cup?.resource.reduce((prev, current) => (prev.updatedAt.getTime() > current.updatedAt.getTime()) ? prev : current).updatedAt
    else if (cup?.updatedAt) expiredAt = cup.updatedAt
    expiredAt.setDate(expiredAt.getDate() + +expiredDays)
    return {
        cupId: cupSlug,
        resources: cup?.resource?.map((resource) => resource.name) || [],
        createdAt: cup?.createdAt || new Date(),
        expiredAt
    }
}

export async function deleteCup(cupSlag: string) {
    await db.entity.deleteMany({
        where: {
            resource: {
                cup: {
                    slug: cupSlag
                }
            }
        }
    })
    await db.resource.deleteMany({
        where: {
            cup: {
                slug: cupSlag
            }
        }
    })
    await db.cup.deleteMany({
        where: {
            slug: cupSlag
        }
    })
    return {
        cupId: cupSlag
    }
}