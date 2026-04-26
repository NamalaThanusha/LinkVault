function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-600">404</h1>
        <p className="text-xl text-gray-600 mt-4">Page not found!</p>
        <a href="/login" className="text-blue-500 underline mt-4 block">
          Go to Login
        </a>
      </div>
    </div>
  )
}

export default NotFoundPage