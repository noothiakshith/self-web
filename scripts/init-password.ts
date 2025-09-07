import prisma from '../src/lib/prisma'
import * as bcrypt from 'bcryptjs'

async function main() {
  const hashedPassword = await bcrypt.hash(process.env.UPLOAD_PASSWORD || '', 10)
  
  await prisma.settings.upsert({
    where: { id: 'upload-settings' },
    update: { password: hashedPassword },
    create: {
      id: 'upload-settings',
      password: hashedPassword
    }
  })
  
  console.log('Upload password initialized')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
