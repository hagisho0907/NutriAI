import React from 'react'

// Placeholder components kept for documentation purposes.
// The previous example implementations depended on legacy store types.
// These lightweight examples avoid compile-time breakage while the new
// store APIs are being finalized.

export const AuthExample: React.FC = () => {
  return (
    <div className="p-4 space-y-2">
      <h2 className="text-xl font-semibold">Auth Example</h2>
      <p className="text-sm text-gray-600">
        Replace this component with your authentication UI when the new auth
        APIs settle. For now it simply renders static content to keep the build
        green.
      </p>
    </div>
  )
}

export const NutritionDashboard: React.FC = () => {
  return (
    <section className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold">Nutrition Dashboard Example</h2>
      <p className="text-sm text-gray-600">
        The real dashboard should read data from the nutrition store. This
        placeholder keeps the example exports usable without depending on
        evolving store shapes.
      </p>
    </section>
  )
}

export const MealLogging: React.FC = () => (
  <div className="p-4 border rounded">
    <h2 className="text-lg font-semibold">Meal Logging Example</h2>
    <p className="text-sm text-gray-600">
      Hook this up to `useMealStore` once the data model is finalized.
    </p>
  </div>
)

export const ExercisePlanner: React.FC = () => (
  <div className="p-4 border rounded">
    <h2 className="text-lg font-semibold">Exercise Planner Example</h2>
    <p className="text-sm text-gray-600">
      Intended as a showcase for exercise-related store actions.
    </p>
  </div>
)

export const BodyMetricsWidget: React.FC = () => (
  <div className="p-4 border rounded">
    <h2 className="text-lg font-semibold">Body Metrics Widget</h2>
    <p className="text-sm text-gray-600">
      Display summaries from the body metrics store here.
    </p>
  </div>
)

export const ChatExample: React.FC = () => (
  <div className="p-4 border rounded">
    <h2 className="text-lg font-semibold">Chat Example</h2>
    <p className="text-sm text-gray-600">
      Showcase AI chat interactions once the chat store API is stable.
    </p>
  </div>
)

