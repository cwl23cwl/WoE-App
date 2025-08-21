export default function BasicTestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Basic Test Page</h1>
      <p>If you can see this, the server is working correctly!</p>
      <p>Server: localhost:3004</p>
      <p>Time: {new Date().toLocaleTimeString()}</p>
    </div>
  )
}