import { useState } from 'react'
export default function MenuManager(){
  const [items, setItems] = useState([
    {id:1,name:'Iced Latte',price_cents:28000,category:'Coffee'}
  ])
  const [newName, setNewName] = useState('')
  function addItem(){
    setItems(prev=>[...prev, {id:Date.now(), name:newName, price_cents:0, category:'Uncategorized'}])
    setNewName('')
  }
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Menu Manager</h2>
      <div className="mb-4 flex gap-2">
        <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="New item name" className="p-2 border rounded"/>
        <button onClick={addItem} className="px-3 py-1 bg-black text-white rounded">Add</button>
      </div>
      <div>
        {items.map(it=>(
          <div key={it.id} className="p-3 bg-white rounded mb-2 flex justify-between items-center shadow">
            <div>
              <div className="font-medium">{it.name}</div>
              <div className="text-sm text-gray-500">{it.category} • Rp {it.price_cents}</div>
            </div>
            <div className="text-sm">
              <button className="mr-2 text-blue-600">Edit</button>
              <button className="text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
