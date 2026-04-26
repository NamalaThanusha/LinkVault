// prisma.config.ts
import { defineConfig } from 'prisma/config'
import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DIRECT_URL as string

export default defineConfig({
  datasource: {
    url: connectionString,
  },
  migrate: {
    async adapter() {
      const pool = new pg.Pool({ connectionString })
      return new PrismaPg(pool)
    },
  },
})