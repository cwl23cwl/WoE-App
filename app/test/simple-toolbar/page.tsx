export default function SimpleToolbarTest() {
  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Simple Toolbar Test</h1>
      <p>If you can see this text, the page is loading correctly.</p>
      
      <div className="mt-8 space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <p>This is a basic test page to verify routing works.</p>
        </div>
        
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded">Test Button 1</button>
          <button className="px-4 py-2 bg-green-500 text-white rounded">Test Button 2</button>
        </div>
      </div>
    </div>
  )
}