import { Prisma, PrismaClient } from '@prisma/client'

// Array of models that uses soft delete
const softDeleteModels = ['Account']

const prisma = new PrismaClient().$extends({
  // TODO: Search for a way to not bring deleted records in relations inclusion
  name: 'soft-delete',
  model: {
    $allModels: {
      // Define soft delete function to single record
      async softDelete<T>(this: T, args: Prisma.Args<T, 'delete'>) {
        const context = Prisma.getExtensionContext(this)

        const result = await (context as any).update({
          where: args.where,
          data: {
            deleted_at: new Date()
          }
        })

        return result
      },
      // Define soft delete function to multiple records
      async softDeleteMany<T>(this: T, args: Prisma.Args<T, 'deleteMany'>) {
        const context = Prisma.getExtensionContext(this)

        const result = await (context as any).update({
          where: args.where,
          data: {
            deleted_at: new Date()
          }
        })

        return result
      }
    }
  },
  query: {
    // Rewrited most find queries to use soft delete
    // IMPORTANT: If you want to list all the records define { deltedAt: undefined } on the where query
    $allModels: {
      async findFirst({ model, args, query }) {
        if (!softDeleteModels.includes(model)) return query(args)

        args.where = { deleted_at: null, ...args.where }

        return query(args)
      },
      async findMany({ model, args, query }) {
        if (!softDeleteModels.includes(model)) return query(args)

        args.where = { deleted_at: null, ...args.where }

        return query(args)
      },
      async findFirstOrThrow({ model, args, query }) {
        if (!softDeleteModels.includes(model)) return query(args)

        args.where = { deleted_at: null, ...args.where }

        return query(args)
      },
      async findUnique({ model, args, query }) {
        if (!softDeleteModels.includes(model)) return query(args)

        args.where = { deleted_at: null, ...args.where }

        return query(args)
      },
      async findUniqueOrThrow({ model, args, query }) {
        if (!softDeleteModels.includes(model)) return query(args)

        args.where = { deleted_at: null, ...args.where }

        return query(args)
      }
    }
  }
})

export default prisma
