export default function MenuManager(){
  const menuItems = [
    {id:1, name:'Curry Rice', price:20000, category:'Rice Bowls', description:'A hearty curry made with tender pork, carrots, and potatoes for a rich, comforting flavor in every bite.'},
    {id:2, name:'Panda Teriyaki', price:20000, category:'Rice Bowls', description:'Tender chicken glazed with teriyaki sauce, served with rice alongside cabbage for a healthy delicious meal'},
    {id:3, name:'Japanese Sando', price:10000, category:'Desserts', description:'A delicacy filled with sweet whipped cream, fresh shine muscat, strawberries, and a slice of mango!'},
    {id:4, name:'Java Tea', price:10000, category:'Beverages', description:'A refreshing herbal blend made from pandan leaf, black tea, and basil seeds for a naturally aromatic and soothing drink.'}
  ]

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Menu Manager</h2>

      <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg mb-6">
        <p className="font-medium">Current Menu (View Only)</p>
        <p className="text-sm mt-1">Menu items are currently managed in the code. To update menu items, prices, or descriptions, edit the files in <code className="bg-blue-100 px-1 py-0.5 rounded">src/pages/ItemPage.jsx</code> and <code className="bg-blue-100 px-1 py-0.5 rounded">src/pages/Home.jsx</code></p>
      </div>

      <div className="grid gap-4">
        {menuItems.map(item=>(
          <div key={item.id} className="p-4 bg-white rounded-lg shadow border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">{item.category}</span>
                  <span className="text-lg font-bold text-[#4B7342]">Rp {item.price.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
