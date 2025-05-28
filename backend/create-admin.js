const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Creating admin users...')

  try {
    // Create admin users first
    const adminPassword = await bcrypt.hash('admin123', 10)

    // Delete existing admins if any
    await prisma.admin.deleteMany({
      where: {
        OR: [
          { email: 'admin@edupractice.com' },
          { email: 'teacher@edupractice.com' }
        ]
      }
    })

    console.log('🗑️ Cleared existing admin users')

    const superAdmin = await prisma.admin.create({
      data: {
        email: 'admin@edupractice.com',
        password: adminPassword,
        name: 'Super Administrator',
        role: 'super_admin',
        schoolName: 'EduPractice Academy',
        permissions: ['*']
      }
    })

    const schoolAdmin = await prisma.admin.create({
      data: {
        email: 'teacher@edupractice.com',
        password: adminPassword,
        name: 'School Teacher',
        role: 'teacher',
        schoolName: 'EduPractice Academy',
        permissions: ['manage_questions', 'view_analytics']
      }
    })

    console.log('✅ Created admin users successfully!')
    console.log('\n👤 Demo Admin Accounts:')
    console.log('👨‍💼 Super Admin:')
    console.log('   📧 Email: admin@edupractice.com')
    console.log('   🔑 Password: admin123')
    console.log('   🎯 Role: super_admin')
    console.log('')
    console.log('👨‍🏫 Teacher:')
    console.log('   📧 Email: teacher@edupractice.com')
    console.log('   🔑 Password: admin123')
    console.log('   🎯 Role: teacher')
    console.log('')
    console.log('🚀 You can now login at: http://localhost:3000/admin/login')

  } catch (error) {
    console.error('❌ Error creating admin users:', error)
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })