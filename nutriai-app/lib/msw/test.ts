// MSW Test Script - Run this to verify MSW setup
import { setupMSW } from './index'
import { authService, nutritionService } from '../api/services'

export const testMSWSetup = async () => {
  console.log('🧪 Testing MSW Setup...')
  
  try {
    // Initialize MSW
    await setupMSW()
    console.log('✅ MSW initialized successfully')

    // Test authentication
    console.log('🔐 Testing authentication...')
    const loginResponse = await authService.login({
      email: 'test@example.com',
      password: 'password123'
    })
    console.log('✅ Login successful:', loginResponse.user.email)

    // Test guest login
    const guestResponse = await authService.guestLogin()
    console.log('✅ Guest login successful:', guestResponse.user.email)

    // Test nutrition goals
    console.log('🍎 Testing nutrition endpoints...')
    try {
      const nutritionGoals = await nutritionService.getGoals()
      console.log('✅ Nutrition goals fetched:', nutritionGoals.dailyTargets.calories, 'calories')
    } catch (error) {
      console.log('ℹ️ Nutrition goals not found (expected for new user)')
    }

    // Test daily nutrition
    const todayString = new Date().toISOString().split('T')[0]
    const dailyNutrition = await nutritionService.getDailyNutrition(todayString)
    console.log('✅ Daily nutrition fetched for', dailyNutrition.date)

    console.log('🎉 All MSW tests passed!')
    return true

  } catch (error) {
    console.error('❌ MSW test failed:', error)
    return false
  }
}

// Run tests if called directly (for debugging)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Delay to ensure MSW is initialized
  setTimeout(() => {
    testMSWSetup().then(success => {
      if (success) {
        console.log('✅ MSW is working correctly!')
      } else {
        console.error('❌ MSW setup has issues')
      }
    })
  }, 2000)
}